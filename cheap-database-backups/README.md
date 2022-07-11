# Cheap Database Backups

There are two pieces to backing up the cheap (CloudSQL) database:

- A Cloud Function (`gcs-function`) that exports SQL dumps from the database to Cloud Storage (GCS).
- A Cloud Run service (`s3-service`) that syncs the exported SQL dumps from GCS to S3.

Both of these things are scheduled by Cloud Scheduler.

## Deployment

In this folder, run `make deploy`.

Then, in the GCP console, update the environment variables for the `cheap-database-backup` Cloud Function to have the following environment variables:

- `PROJECT_ID`
- `DATABASE_INSTANCE`
    - The name of the instance.
- `DATABASE_BACKUPS_BUCKET`
    - Just the bucket name, e.g. `ufincs2-cluster-database-backups`.

For the `cheap-database-backups-s3-service` Cloud Run service, add the following environment variables:

- `AWS_SECRET_ACCESS_KEY`
- `AWS_ACCESS_KEY_ID`
- `GCS_BUCKET_PATH`
    - Should include the path to the folder, e.g. `gs://ufincs2-cluster-database-backups/cloudsql`
- `S3_BUCKET_PATH`
    - Should include the path to the folder, e.g. `s3://ufincs-cluster-database-backups/cloudsql`

The AWS secrets can be found in the `.env.encrypted` file in this folder (decrypt through `gcloud kms` as usual).
Note: The AWS secrets for this service are different from those used for the `backend-database-backup` because... those secrets didn't work.
