#!/bin/bash

i=${1:-1}

BACKEND_PORT="500${i}" FRONTEND_PORT="300${i}" docker-compose \
    -f ./services/docker-compose.cypress.yaml --project-name="cypress${i}" down -v
