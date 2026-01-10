FROM oven/bun:1.3.3-alpine AS base

# --- PREPARE STAGE ---
FROM base AS prepare
WORKDIR /app

# Install turbo globally
RUN bun add -g turbo@^2.6.1

# Copy everything
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @repo/api --docker

# --- BUILDER STAGE ---
FROM base AS builder
WORKDIR /app

# Prune and copy dependencies (as they change less often)
COPY --from=prepare /app/out/json/ .

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the files (as they change more often)
COPY --from=prepare /app/out/full/ .

# Build the app and migration script
RUN bunx turbo run build
RUN bun build --compile packages/db/src/migrate.ts --outfile migrate-exe

# --- RUNNER STAGE ---
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    HOSTNAME="0.0.0.0" \
    PORT=8000

COPY --from=builder /app/apps/api/api-exe ./api-exe
COPY --from=builder /app/migrate-exe ./migrate-exe
COPY --from=builder /app/packages/db/src/migrations ./migrations

USER bun
EXPOSE 8000

ENTRYPOINT [ "/bin/sh", "-c", "./migrate-exe && ./api-exe" ]