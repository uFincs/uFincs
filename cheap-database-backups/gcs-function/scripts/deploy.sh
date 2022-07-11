#!/bin/sh

gcloud functions deploy cheap-database-backup \
    --runtime=nodejs14 \
    --region=us-east1 \
    --trigger-http \
    --entry-point=exportDatabase
