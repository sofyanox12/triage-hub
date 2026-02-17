FROM node:20-bookworm-slim AS base
WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@10.27.0 --activate

COPY package.json tsconfig.base.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "--filter", "@triage/web", "run", "start"]
