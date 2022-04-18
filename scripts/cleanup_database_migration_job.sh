#!/bin/sh

# Note: We do _not_ want to use `set -e` to fail on errors, since we don't care if we fail to delete
# the job. Mainly because we _expect_ not to be able to delete the job when first deploying a new
# branch.

namespace=$(echo "$1" | tr '[:upper:]' '[:lower:]') # Need to make sure it's lowercase.

echo "Cleaning up migration job..."
kubectl -n $namespace delete job backend-migration-job
echo "Finished cleaning up migration job."