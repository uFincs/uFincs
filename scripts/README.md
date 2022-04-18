# Scripts

These are just some useful utility scripts that apply across the entire repo but are mostly used in the Cloud Build pipeline.

```
├── cleanup_database_migration_job.sh               # Deletes the Kubernetes job that is used for performing database migrations.
├── cleanup_prod_database.sh                        # Just an old script; ignore.
├── cleanup_stripe_webhooks.sh                      # Deletes the Stripe webhooks out of namespaces (branches) that have been deleted.
├── clear_nginx_cache.sh                            # Clears the Nginx cache. Found this needed sometimes for production deployments.
├── cloudbuild_cleanup.sh                           # Cleans up Kubails state in the build pipeline in the event of a build failure.
├── cypress_down_parallel_service.sh                # Runs `docker-compose down` across on a single Cypress docker-compose instance.
├── cypress_down_parallel_services.sh               # Runs `docker-compose down` across all of the Cypress docker-compose instances.
├── cypress_reset_db.sh                             # Resets the Backend database to default seed state for Cypress tests.
├── cypress_run_parallel.sh                         # Starts up the actual Cypress tests against the parallel Cypress docker-compose instances.
├── cypress_start_parallel_service.sh               # Starts a single instance of the Cypress docker-compose stack.
├── cypress_start_parallel_services.sh              # Starts up all parallel instances of the Cypress docker-compose stack.
├── database_deploy_build_step.sh                   # The script for deploying the database in the build pipeline.
├── inject_database_password.sh                     # Injects the database password into kubails.json at build time.
├── inject_stripe_webhook_secret.sh                 # Injects the Stripe webhook secret into kubails.json at build time.
├── load_production_backup_into_local_database.sh   # Helper script for loading a production database snapshot into docker-compose.
├── restore_latest_backup.sh                        # Restores the latest production backup into one of the per-branch namespace deployments.
└── wait_for_migration_completion.sh                # Helper build script for waiting on the database migration job to complete.
```
