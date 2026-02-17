# AI Support Triage Hub

Production-hardened MVP for asynchronous support ticket triage.

## Architecture

The system is split into three runtime processes:

- `web` (Next.js): operator UI
- `api` (Express): ingestion/read APIs
- `worker` (BullMQ): background AI processing

Supporting infrastructure:

- PostgreSQL (source of truth)
- Redis (queue broker + worker coordination)
- Kysely (type-safe SQL builder)
- Zod (strict runtime validation)

### Why worker is isolated from API

`POST /tickets` must stay fast and deterministic under AI latency spikes.

- API only writes ticket + enqueues job, then returns `201`.
- AI execution is isolated in worker process/container.
- Worker failures and retries never block request/response path.

## Ticket Lifecycle

Lifecycle is enforced as:

- `PENDING` -> `PROCESSING` -> `COMPLETED` -> `RESOLVED`
- `PENDING` -> `PROCESSING` -> `FAILED` (after final retry)

Rules:

- Worker sets `PROCESSING` at job start.
- On successful AI + DB update, status becomes `COMPLETED`.
- On intermediate failure, status returns to `PENDING` for retry.
- On final failure (attempt 3), status becomes `FAILED`.
- `PATCH /tickets/:id/resolve` only succeeds for `COMPLETED` tickets.
- Already resolved ticket returns `409`.

## Reliability Controls

### Non-blocking ingestion

`POST /tickets` performs only:

1. Insert ticket as `PENDING`
2. Enqueue BullMQ job (`jobId=ticketId`)
3. Return `201`

No AI call exists in API route handler.

### Idempotency

- Queue job identity: one job per ticket (`jobId = ticketId`)
- Worker guard skips already finalized tickets (`COMPLETED`/`RESOLVED`)
- Worker claims only `PENDING` tickets before processing

### Retry and backoff

BullMQ defaults:

- `attempts: 3`
- exponential backoff with base `2000ms`

Failures that trigger retry:

- AI timeout
- malformed JSON
- Zod validation failure
- DB update failure

After final retry failure, ticket is marked `FAILED`.

### Strict AI validation

Worker validates AI output with `safeParse` against strict schema:

```json
{
  "category": "Billing" | "Technical" | "Feature Request",
  "sentimentScore": 1-10,
  "urgency": "High" | "Medium" | "Low",
  "draft": "string (min 10)"
}
```

Unvalidated output is never stored.

### Structured logging

API and worker use `pino` only (no `console.log`).

Logged fields include:

- `requestId`
- `ticketId`
- `jobId`
- retry attempt
- AI latency
- processing duration

## Database

Kysely is used for type-safe SQL queries and migrations.

Migrations are in `packages/shared/src/migrations`.

## Health Checks

### API

`GET /health` returns `200` only when both are healthy:

- PostgreSQL query success (`SELECT 1`)
- Redis ping returns `PONG`

Otherwise it returns `503`.

### Worker

Worker health command checks:

- PostgreSQL query success
- Redis ping success

Docker healthcheck runs `node dist/health.js` in worker container.

## Frontend Behavior

- `PENDING` / `PROCESSING` shown as `Processing...`
- `FAILED` shown with failure badge
- Resolve button disabled unless status is `COMPLETED`
- Resolve action uses optimistic update with rollback on API failure
- Ticket list supports pagination and urgency sorting

## Repository Structure

```txt
/apps
  /web
  /api
  /worker
/packages
  /shared
/docker-compose.yml
```

## Environment Variables

Copy `.env.example` to `.env`.

Required/important variables:

- `DATABASE_URL`
- `REDIS_URL`
- `AI_PROVIDER=mock|openai`
- `AI_API_KEY` (required if `AI_PROVIDER=openai` or `gemini`)
- `AI_MODEL`
- `AI_TIMEOUT_MS`
- `WORKER_PROCESSING_DELAY_MS`
- `API_LOG_LEVEL`
- `WORKER_LOG_LEVEL`
- `NEXT_PUBLIC_API_BASE_URL`
- `INTERNAL_API_BASE_URL`

## Run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## Non-blocking Ingestion Verification (5s Worker Delay)

1. Set delay in `.env`:

```bash
WORKER_PROCESSING_DELAY_MS=5000
```

2. Start stack:

```bash
docker compose up --build
```

3. Run ingestion latency check:

```bash
pnpm run test:non-blocking -w @triage/api
```

Script sends 5 `POST /tickets` requests and asserts max latency against `INGEST_THRESHOLD_MS` (default `100ms`).

## Running the project

```bash
pnpm install
cp .env.example .env
pnpm run db:migrate -w @triage/api
pnpm run dev -w @triage/api
pnpm run dev -w @triage/worker
pnpm run dev -w @triage/web
```

## Graceful Shutdown

API and worker handle `SIGTERM` / `SIGINT` and close resources in order:

- HTTP server (API)
- BullMQ queue/worker
- Kysely instance
- Redis connection

Worker shutdown waits for active jobs to complete to avoid job corruption.
