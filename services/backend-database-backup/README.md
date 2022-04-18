# Backend Database Backup

This 'service' is actually a cronjob that gets deployed alongside every namespace to handle doing database backups on a schedule.

Since it is a Kubails servce, all of the necessary configuration can be found in the root `kubails.json` config file. 

## How it Works

Basically, this service has its own image built and stored in Container Registry just like any other service. The only difference is that instead of using a `deployment` template, this service uses a `cronjob` template to run on a set schedule to `pg_dump` the database of the namespace and upload the dump to the `ufincs-database-backups` storage bucket. Pretty simple.

## Secrets/Environment Variables

The following are the secrets stored in `.env.encrypted`. These are exposed to the service as environment variables.

- `AWS_SECRET_ACCESS_KEY`: The access key for the AWS CLI
- `AWS_ACCESS_KEY_ID`: The key ID for the AWS CLI
- `ENCRYPTION_KEY`: The key (aka password) to use for encrypting the backups

The following are additional environment variables that can be provided (currently, these are set through `kubails.json`):

-   `NODE_ENV`
-   `POSTGRES_PASSWORD`
