FROM node:22.14.0-alpine AS frontend-build-env

ENV NPM_CONFIG_LOGLEVEL="warn"

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /frontend
WORKDIR /frontend

COPY package.json package-lock.json ./

# Note: Because of how we have our dev/production deps set up (with only Cypress stuff in dev),
# we can't take advantage of caching 'production only' deps, cause we don't actually have a list
# of 'production only' deps.
RUN npm ci --omit=dev

COPY . .

RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12

COPY --from=frontend-build-env /frontend/build /frontend/build
COPY --from=frontend-build-env /frontend/node_modules /frontend/node_modules
COPY --from=frontend-build-env /frontend/public /frontend/public
COPY --from=frontend-build-env /frontend/server /frontend/server

WORKDIR /frontend
USER nonroot

EXPOSE 3000

CMD ["server"]