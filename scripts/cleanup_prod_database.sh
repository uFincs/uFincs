#!/bin/sh

# The following cleanup script is only relevant for the database snapshot taken on December 22, 2020.

cat ./services/backend/scripts/cleanup-prod-database.sql | docker exec -i ufincs_backend-database_1 psql -U app-database-user -d app-database