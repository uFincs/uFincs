#!/bin/sh

gcloud builds submit --tag "gcr.io/ufincs2/cheap-database-backups-s3-service:latest" .

gcloud run deploy cheap-database-backups-s3-service \
    --image "gcr.io/ufincs2/cheap-database-backups-s3-service:latest" \
    --region us-east1 \
    --concurrency 1 \
    --max-instances 1
