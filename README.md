# AI Support Triage Hub

An intelligent support triage system that automatically analyzes incoming tickets using AI to determine sentiment, urgency, and category.

## Architecture

- **Web**: Next.js frontend with Tailwind CSS and TanStack Query.
- **API**: Express.js server providing RESTful endpoints.
- **Worker**: BullMQ-based background processor for AI triage tasks.
- **Database**: PostgreSQL with Kysely for type-safe queries.
- **Cache/Queue**: Redis for BullMQ and SSE message distribution.

> All API routes are prefixed with `/api`.

## Quick Start (Docker Compose)

The easiest way to run the entire stack:

```bash
# 1. Setup environment
cp .env.example .env

# 2. Start services
docker compose up --build
```

Access the application at [http://localhost:3000](http://localhost:3000).

## Local Development (Non‑Docker)

Ensure you have Node.js 20+ and pnpm 9+ installed.

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Note: Update DATABASE_URL and REDIS_URL to use localhost if running outside Docker

# 3. Run migrations
pnpm run db:migrate -w @triage/api

# 4. Start development servers
pnpm run dev
```

## Environment Variables

Key variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string.
- `ACCESS_TOKEN_SECRET`: Secret for JWT authentication.
- `AI_PROVIDER`: `openai`, `gemini`, or `mock`.
- `AI_API_KEY`: API key for the chosen provider (optional if using mock).
- `AI_MODEL`: Specific model version (e.g., `gemini-3-flash-preview`).
- `NEXT_PUBLIC_API_BASE_URL`: API URL for the frontend.
- `TEST_USER_EMAIL`: Email for running tests (e.g., `shawn@gmail.com`).
- `TEST_USER_PASSWORD`: Password for running tests.

## Scripts

### Root Project

- `pnpm run dev`: Start all apps in parallel.
- `pnpm run build`: Build all packages and apps.
- `pnpm run lint`: Run linting across the workspace.
- `pnpm run type-check`: Run TypeScript type checks.

### API (`@triage/api`)

CD into the `apps/api` directory and run:

- `pnpm run dev`: Start API in dev mode.
- `pnpm run db:migrate`: Run database migrations.
- `pnpm run test:non-blocking`: Run non-blocking ingestion check.

### Worker (`@triage/worker`)

CD into the `apps/worker` directory and run:

- `pnpm run dev`: Start worker service.

### Web (`@triage/web`)

CD into the `apps/web` directory and run:

- `pnpm run dev`: Start Next.js frontend.

## Non‑Blocking Ingestion Check

To verify that the system handles ticket ingestion asynchronously:

1. Configure `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `.env`.
2. Set `WORKER_PROCESSING_DELAY_MS=5000` in `.env`.
3. Run `pnpm run test:non-blocking` in the `apps/api` directory.
4. Observe that the API returns immediately (SLA check) while the worker is still processing.
