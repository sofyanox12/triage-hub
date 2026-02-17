FROM node:20-bookworm-slim AS base
WORKDIR /app

RUN npm install -g pnpm@10.2.7

COPY package.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm run build --filter @triage/web

EXPOSE 3000
CMD ["pnpm", "run", "start", "--filter", "@triage/web"]
