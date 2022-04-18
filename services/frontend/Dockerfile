FROM node:14-alpine as frontend-build-env

ENV NPM_CONFIG_LOGLEVEL warn

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN mkdir -p /frontend
WORKDIR /frontend

COPY package.json package-lock.json ./

# Note: Because of how we have our dev/production deps setup (with only Cypress stuff in dev),
# we can't take advantage of caching 'production only' deps, cause we don't actually have a list
# of 'production only' deps.
RUN npm ci --production

COPY . .

RUN npm run ci && \
    npm run build

FROM gcr.io/distroless/nodejs:14

COPY --from=frontend-build-env /frontend/build /frontend/build
COPY --from=frontend-build-env /frontend/node_modules /frontend/node_modules
COPY --from=frontend-build-env /frontend/public /frontend/public
COPY --from=frontend-build-env /frontend/server /frontend/server

WORKDIR /frontend
USER nonroot

EXPOSE 3000

CMD ["server"]