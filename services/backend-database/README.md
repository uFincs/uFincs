# Backend Database

The Backend Database service is the Postgres database that holds all of the data for uFincs. There's nothing particularly special that we're doing with it; we've only modified the logging configuration a little compared to the base Postgres Docker image.

## Environment Variables

The following are standard Postgres environment variables that can be provided (currently, these are set through `kubails.json`):

- `POSTGRES_DB`
- `POSTGRES_PASSWORD`
- `POSTGRES_USER`