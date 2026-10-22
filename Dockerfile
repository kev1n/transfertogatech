# Pinned to a Node release that includes the 2026-10-21 security fixes.
FROM node:22.23.4-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG MONGODB_URI
RUN npm run build && npm prune --omit=dev

FROM node:22.23.4-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
