FROM node:20-bookworm-slim AS base
WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && corepack enable \
  && corepack prepare pnpm@10.27.0 --activate \
  && rm -rf /var/lib/apt/lists/*

COPY package.json tsconfig.base.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm run build

EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter @triage/api run db:migrate && pnpm --filter @triage/api run start"]
