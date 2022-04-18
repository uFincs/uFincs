# Backend

The Backend service acts as a lightweight database access layer, where really all it does it either persist or retrieve data. This is because the bulk of the application logic exists strictly on the Frontend, since uFincs is an offline-first and client-side encrypted app.

## Table of Contents

-   [Tech Stack](#tech-stack)
-   [File Structure](#file-structure)
-   [Running Locally for Development](#running-locally-for-development)
-   [Other Useful Development Commands](#other-useful-development-commands)
-   [Secrets/Environment Variables](#secretsenvironment-variables)
-   [Database Setup](#database-setup)
-   [Important Data Flows](#important-data-flows)

## Tech Stack

-   Language: TypeScript/Node
-   API Framework: Feathers.js + Express
-   ORM: Sequelize (backed by Postgres)

## File Structure

The following is a high-level breakdown of the file structure. More detailed explanations of particulars folder can be found in most folders' README.

```
├── config                          # Feathers configuration files
├── Dockerfile                      # Docker configuration for production
├── Dockerfile.development          # Docker configuration for development
├── jest.config.js                  # Misc jest config
├── Makefile                        # Makefile for common developer commands; used by Kubails
├── package.json                    # You know what this is
├── package-lock.json               # ^ Ditto
├── scripts/                        # Misc scripts
├── src/                            # Primary source code
|   ├── app.hooks.ts                # Top-level app-scoped hooks
|   ├── app.ts                      # Main app setup
|   ├── authentication.ts           # Authentication configuration for JWT auth
|   ├── channels.ts                 # Feathers-generated file for their 'channels' feature; currently unused
|   ├── db/                         # Database configuration and table schemas
|   ├── emailTemplates/             # HTML email templates for use with our email provider (currently Mailgun)
|   ├── hooks/                      # Other shared Feathers hooks
|   ├── index.ts                    # Server setup and main entrypoint to the Backend
|   ├── logger.ts                   # General logging configuration
|   ├── middleware/                 # Misc Express middleware
|   ├── models/                     # Sequelize database models
|   ├── requestLogger.ts            # Request-specific logging configuration
|   ├── services/                   # Feathers services (aka the core of the Backend)
|   ├── types/                      # Misc TypeScript type declarations
|   ├── types.ts                    # Shared TypeScript types
|   ├── utils/                      # Misc shared utilities
|   └── values/                     # Shared constant values
└── tsconfig.json                   # TypeScript config
```

## Running Locally for Development

There are multiple options for running the Backend service locally.

1. Run it using `docker-compose` (see root repo README for instructions) <- this is the recommended way
2. Run it directly using Docker
3. Run it directly using `npm`

Before doing any of these things, provide a `config/local.json` file for configuration. See [Secrets/Environment Variables](#secretsenvironment-variables) for details.

Note: You still need to have the database running (and configured) for the Backend to actually work. The `docker-compose` config handles this by default, but see [below](#database-configuration) for details on configuring a standalone database.

### Docker

To run the Backend service standalone using Docker:

```
docker build -t ufincs-backend -f Dockerfile.development .
docker run -it --rm -p 5000:5000 ufincs-backend
```

The Backend will then be accessible over [localhost:5000](http://localhost:5000).

### NPM

To run the Backend service standalone using `npm`:

```
npm ci
npm start
```

The Backend will then be accessible over [localhost:5000](http://localhost:5000).

## Other Useful Development Commands

Linting:

```
make lint
```

Testing:

```
make test
```

Everything used in the build pipeline:

```
make ci
```

## Secrets/Environment Variables

The following are the secrets stored in `.env.encrypted`. These are exposed to the service as environment variables.

-   `MAILGUN_API_KEY`: The API key for Mailgun
-   `SLACK_WEBHOOK`: A Slack webhook for posting certain messages to a Slack channel
-   `SLACK_WEBHOOK_TEST`: A Slack webhook for posting certain messages to a Slack channel (in non-prod deployments)
-   `STRIPE_SECRET_KEY_TEST`: Stripe secret key for non-prod deployments
-   `STRIPE_SECRET_KEY_PROD` Stripe secret key for prod
-   `TOKEN_SECRET`: Secret used by Feathers for JWT generation

The following are additional environment variables that can be provided (currently, these are set through `kubails.json`):

-   `NODE_ENV`
-   `POSTGRES_PASSWORD`
-   `STRIPE_WEBHOOK_SECRET`

In order to provide these environment variables when testing locally, rather than providing a `.env` file, values should be provided through a `config/local.json` file to hook into Feathers' config system. The `config/production.json` file can be used as an example, where the values (which — as is — are interpreted by Feathers as environment variables) can instead be swapped out for the actual values of the config properties.

## Database Setup

Everything relating to configuring the database (i.e. schema, models, seeders, migrations, etc) can be found in the `src/db/` folder.

Database migrations and seeding happens before the Backend service starts. As such, by time the Backend service is running, it should already be able to operate on the database without needing to do anything else.

The process that handles running the migrations/seeds is different depending on which environment you are working in:

-   In development, a separate `docker-compose` service (`backend-database-migrate`) runs before the `backend` service comes up. It uses the same Docker image as the `backend` service, just with a different start command (`npm run db:retryable-migrate && npm run db:seed`).
-   In production (i.e. on the Kubernetes cluster), a script runs the same migration and seed commands during the build pipeline, before the `backend` container is allowed to come up.

Obviously always running the migrations before service start has the possibility of opening us up to possible data corruption problems if we somehow mess up a migration. As such, it is policy that migrations are strictly append-only. That is, old migrations are never to be changed or deleted; only new migrations should be created to either introduce new changes or alter old ones. Additionally, all new migrations must be timestamped in the file name, so that we/the migrator know which order migrations are executed in.

As long as we maintain this append-only policy, we should adequately mitigate the risks of data corruption.

### Database Configuration

The database configuration (i.e. host) is not done through environment variables. For historical reasons, it is just configured directly in `src/db/config.ts`. To change the host used for either the dev or prod environments, change it there.

Note: The current database host is configured as just `backend-database`. This works in dev because the `docker-compose` hostname for the database is `backend-database`, and this works in production because the Kubernetes service name for the database is `backend-database`. Very convenient.

## Important Data Flows

The following are various important data flows that show how the Backend works.

### Feathers Services - or - How a Request is Handled

```
Frontend -> Request -> Backend -> Service Hooks -> Service Methods -> Sequelize -> Database
```

The main Express/Feathers configuration is all done in `src/app.ts`. This primarily means registering various middleware for handling requests in various ways.

For the purposes of the Backend's business logic, everything is handled by Feathers `services`. All of these services can be found under the `src/services/` folder (named as such to try and group things more so by domain than function).

Each of these `services` defines the Sequelize model that is associated with the Feathers `service` (found in the `src/models/` folder), the Feathers `service` itself, and the `hooks` that apply business logic to the `service`.

Right now, each of our Feathers `services` is defined using the `feathers-sequelize` package; as such, each service is associated with exactly one Sequelize model (or none, in some special cases), and routes are automatically generated to cover all of the CRUD operations -- both at the request level (i.e. GET, POST, etc) and at the database level. For example, the Account `service` is defined based on the Sequelize `Account` model.

For more information on exactly what gets generated for these services, see the [Feathers services docs](https://docs.feathersjs.com/api/services.html) and the [feathers-sequelize docs](https://github.com/feathersjs-ecosystem/feathers-sequelize).

`Hooks` are Feathers' way of implementing custom business logic on top of whatever logic is already implemented as part of the `service` routes (aka `service` methods). They sit in front of or after the `service` methods and enable any sort of data manipulation that is needed.

Once the request has made its way through the `before` hooks, it then hits the `service` method, wherein Sequelize will act on the data according to the type of request being made (e.g. a lookup for a GET request on the `get` method, or data persistence for a `POST` request on the `create` method).

Sequelize might then return some data; this data is then fed through the `after` hooks (possibly being manipulated again) before being returned to the client as the request response.

And that's the data flow for a single request through the Backend.
