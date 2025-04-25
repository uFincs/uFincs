#!/bin/sh

PROJECT_NAME=${1:-ufincs}

if [ "$PROJECT_NAME" != "ufincs" ]; then
    COMPOSE_FILE=./services/docker-compose.cypress.yaml

    BACKEND_PORT=${2:-5000}
    FRONTEND_PORT=${3:-3000}

    BASE_COMMAND="BACKEND_PORT=$BACKEND_PORT FRONTEND_PORT=$FRONTEND_PORT \
        docker compose --project-name $PROJECT_NAME -f $COMPOSE_FILE"
else
    COMPOSE_FILE=./services/docker-compose.yaml
    BASE_COMMAND="docker compose --project-name $PROJECT_NAME -f $COMPOSE_FILE"
fi

# Use -T because running the script barfs without it when running in a GCP instance.
# Something about a TTY not being present.
BASE_DATABASE_COMMAND="$BASE_COMMAND exec -T backend-database"
BASE_BACKEND_COMMAND="$BASE_COMMAND exec -T backend"

# Drop any connections to the database.
#
# This uses the default `postgres` database as opposed to the `app-database`,
# because we're dropping connections _from_ `app-database`.
#
# SQL taken from https://dba.stackexchange.com/a/11895.
eval "$BASE_DATABASE_COMMAND psql -U app-database-user postgres -c \"SELECT pg_terminate_backend(pid) FROM \
    pg_stat_activity WHERE datname = 'app-database'\""

# Reset the database by recreating it with fresh seed data.

eval "$BASE_BACKEND_COMMAND which npm"

if [ $? -eq 0 ]; then
    # If npm exists in the image, then we're using the dev containers.
    eval "$BASE_BACKEND_COMMAND npm run db:reset"
else
    # Otherwise, we're using the production containers.
    eval "$BASE_BACKEND_COMMAND /nodejs/bin/node scripts/db-reset.js"
fi
