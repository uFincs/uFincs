#!/bin/sh

# Loads a SQL dump from a production database into the local dev database for testing purposes.
# Must be run from the root of the repo, cause some of these commands are relative.

# Get the file name from the first argument.
file=$1

# Copy the file to the /tmp folder of the database container.
docker cp $file ufincs_backend-database_1:/tmp

# Drop any connections to the database.
#
# This uses the default `postgres` database as opposed to the `app-database`,
# because we're dropping connections _from_ `app-database`.
#
# SQL taken from https://dba.stackexchange.com/a/11895.
docker-compose -f ./services/docker-compose.yaml exec backend-database psql -U app-database-user postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'app-database'"

# Drop the existing database.
docker-compose -f ./services/docker-compose.yaml exec backend-database dropdb -U app-database-user app-database

# Re-create the database.
docker-compose -f ./services/docker-compose.yaml exec backend-database createdb -U app-database-user app-database

# Restore the SQL dump.
docker-compose -f ./services/docker-compose.yaml exec backend-database psql -U app-database-user -d app-database -f /tmp/$file
