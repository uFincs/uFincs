FROM node:22.14.0-alpine AS backend-build-env

RUN mkdir -p /backend
WORKDIR /backend

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && \
    mv node_modules /production_node_modules && \
    npm ci

COPY . .

RUN npm run compile

FROM gcr.io/distroless/nodejs22-debian12

COPY --from=backend-build-env /backend/.sequelizerc /backend/.sequelizerc
COPY --from=backend-build-env /backend/config /backend/config
COPY --from=backend-build-env /backend/lib /backend/lib
COPY --from=backend-build-env /backend/scripts /backend/scripts
COPY --from=backend-build-env /production_node_modules /backend/node_modules

WORKDIR /backend
USER nonroot

EXPOSE 5000

# This replicates `npm run start:prod`.
ENV NODE_PATH=lib
CMD ["lib"]

