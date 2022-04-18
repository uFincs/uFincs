#!/bin/sh

set -e

namespace=$(echo "$1" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.

echo "Waiting for migration job to compplete..."

# 120s = 2 minutes should be more than enough time for the database to come up and migrations to run.
kubectl -n $namespace wait --timeout=120s --for=condition=complete job/backend-migration-job

echo "Migration job finished!"