#!/bin/sh

GCLOUD_PROJECT_ID=ufincs2
CONTAINER_IMAGE_NAME=ufincs-marketing

gcloud container images list-tags \
    --project="${GCLOUD_PROJECT_ID}" \
    "gcr.io/${GCLOUD_PROJECT_ID}/${CONTAINER_IMAGE_NAME}" \
    --filter="timestamp.date('%Y-%m-%d', Z)<$(date --date='-90 days' +'%Y-%m-%d')" \
    --format="get(digest)" --limit=999999 | awk '{print "'"gcr.io/${GCLOUD_PROJECT_ID}/${CONTAINER_IMAGE_NAME}@"'" $1}' |
    xargs -n 1 gcloud container images delete --project="${GCLOUD_PROJECT_ID}" --force-delete-tags --quiet
