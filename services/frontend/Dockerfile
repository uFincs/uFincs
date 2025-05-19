# This Dockerfile can be used to build and serve the static assets of the Frontend.
#
# Note: This is included for illustrative purposes; it is not currently used for 
# production uFincs infrastructure (since the Frontend is served via Firebase).

# Stage 1: Build the static app assets
FROM node:22.14.0-alpine@sha256:9bef0ef1e268f60627da9ba7d7605e8831d5b56ad07487d24d1aa386336d1944 AS builder

ENV CYPRESS_INSTALL_BINARY=0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2.10.0-alpine@sha256:e2e3a089760c453bc51c4e718342bd7032d6714f15b437db7121bfc2de2654a6

COPY --from=builder /app/build /app/build

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
