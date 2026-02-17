FROM node:20-bookworm-slim AS base
WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && npm install -g pnpm@10.2.7 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm run build

CMD ["sh", "-c", "pnpm run start -w @triage/worker"]
