#!/bin/sh

BRANCH_NAME=$1

# Note: The reason this build step is its own script is twofold:
#
# 1. It's quite long.
# 2. It declares a variable. Cloud Build doesn't like variables that are declared in build steps that aren't
#    pre-declared 'substitution variables'. Although that just might have been because it was uppercase...

# Don't forget to authenticate so that all the `kubectl` commands work.
kubails cluster authenticate

# Need to store the return values of these commands,
# rather than their outputs (since the outputs are blank).
kubails cluster is-new-namespace ${BRANCH_NAME}
NEW_NAMESPACE=$?

kubails service has-changed --current-branch ${BRANCH_NAME} backend
BACKEND_CHANGED=$?

kubails service has-changed --current-branch ${BRANCH_NAME} backend-database
DATABASE_CHANGED=$?

# Enable failure on error.
set -e

# Make sure to cleanup (i.e.) delete the migration job if it already exists, otherwise
# re-deploying over top of a completed job doesn't do anything.
bash ./scripts/cleanup_database_migration_job.sh ${BRANCH_NAME}

# Deploy the database.
if [ $NEW_NAMESPACE -eq 0 ] || [ $DATABASE_CHANGED -eq 0 ]; then
    echo "Deploying database..."
    kubails cluster manifests deploy backend-database --namespace ${BRANCH_NAME}
else
    echo "Database wasn't changed; not re-deploying database."
fi

if [ $NEW_NAMESPACE -eq 0 ]; then
    # Only want to restore the latest backup when a branch is brand new.
    # The script handles making sure we don't restore to production.
    # Have to do this before migrating, otherwise the migrations will get overwritten.
    bash ./scripts/restore_latest_backup.sh ${BRANCH_NAME}
fi

# Only migrate if the namespace is new or the Backend service has changed.
#
# If the namespace is new, then all images get built regardless.
#
# However, if the namespace isn't new, but the Backend hasn't changed,
# then the `backend-migration-job` will have an invalid image tag on it,
# since Backend wouldn't have been built this deploy.
if [ $NEW_NAMESPACE -eq 0 ] || [ $BACKEND_CHANGED -eq 0 ]; then
    # Migrate the database.
    echo "Migrating database..."
    kubails cluster manifests deploy backend-migration-job --namespace ${BRANCH_NAME}

    # Wait for the migrations to finish before we continue on.
    bash ./scripts/wait_for_migration_completion.sh ${BRANCH_NAME}
else
    echo "Backend wasn't changed; not migrating database."
fi
