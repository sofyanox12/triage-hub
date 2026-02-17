# AI Support Triage Hub

An intelligent support triage system that automatically analyzes incoming tickets using AI to determine sentiment, urgency, and category.

## Architecture

This project is a monorepo managed by **pnpm workspaces**, containing the following components:

### Apps

- **`apps/web`**: The frontend application built with **Next.js** (App Router).
    - **Tech Stack**: React, Tailwind CSS, Radix UI, TanStack Query, React Hook Form.
    - **Features**: Dashboard for support agents, real-time ticket updates via SSE, responsive design.

- **`apps/api`**: The backend REST API built with **Express.js**.
    - **Tech Stack**: Node.js, Express, Kysely (PostgreSQL), Redis (Pub/Sub + Cache).
    - **Responsibilities**: Authentication, ticket management, user management, handling SSE connections.

- **`apps/worker`**: A background worker service for asynchronous tasks.
    - **Tech Stack**: Node.js, BullMQ, Google Gemini / OpenAI.
    - **Responsibilities**: Processing incoming tickets, performing AI analysis (sentiment, priority, category), updating database status.

### Packages

- **`packages/shared`**: Shared code library used across all apps.
    - **Contents**: Database types, Zod schemas, constants, shared utility functions, and AI adapters.

### Infrastructure

- **PostgreSQL**: The primary relational database, accessed via **Kysely** query builder for type safety.
- **Redis**: Used for **BullMQ** job queues and as a Pub/Sub mechanism for real-time updates.
- **Docker Compose**: Orchestrates the entire stack for local development.

> **Note**: All API routes are pre-fixed with `/api`.

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
