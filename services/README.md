# Services

A 'service' represents the individual collection of code that is deployed as part of Kubails. As such, all of these services put together form the entire application codebase for uFincs.

- The two big services are the `frontend` and `backend`: these are where 99% of the code is. 
- The `backend-database` (Postgres) is also managed as a service since we have custom configuration for Postgres. 
- There is also the `marketing` service that manages the [marketing site](https://ufincs.com) for uFincs. 

Each of these services gets deployed as a Kubernetes `deployment` on the cluster, with associated `service` and `ingress` configs as necessary (see Kubails almost non-existent [docs](https://github.com/DevinSit/kubails) for more information).

Finally, there is the `backend-database-backup` 'service'; it's actually a cronjob but it gets managed as a Kubails service for simplicity.

## Docker Compose Configs

There are three `docker-compose` configs available here:

- `docker-compose.yaml`
    - The base config that is used for development. 9 times out of 10, this is the compose config that is used. 
- `docker-compose.cypress.yaml`
    - Similar to the base config, except it allows passing arbitrary port numbers to the services, so that we can spin up a whole bunch of instances on a range of ports.
- `docker-compose.production.yaml`
    - This is just used for testing the production (i.e. non-development) Docker images locally. This isn't actually used in production (that's what Kubernetes is for).
