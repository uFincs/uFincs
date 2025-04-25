FROM node:22.14.0-alpine AS marketing-build-env

ENV NPM_CONFIG_LOGLEVEL="warn"
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /marketing
WORKDIR /marketing

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && \
    mv node_modules /production_node_modules && \
    npm ci

COPY . .

ARG branch
ENV BRANCH="$branch"

RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=marketing-build-env /marketing/.next /marketing/.next
COPY --from=marketing-build-env /marketing/public /marketing/public
COPY --from=marketing-build-env /marketing/server /marketing/server
COPY --from=marketing-build-env /production_node_modules /marketing/node_modules

WORKDIR /marketing
USER nonroot

EXPOSE 3000

CMD ["server"]
