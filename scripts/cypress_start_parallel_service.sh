#!/bin/bash

INDEX=${1:-1}

# Assign each port and project name sequentially.
BACKEND_PORT="500${INDEX}" FRONTEND_PORT="300${INDEX}" docker compose \
    -f ./services/docker-compose.cypress.yaml --project-name="cypress${INDEX}" up --build
