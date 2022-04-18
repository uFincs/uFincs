# Scripts

Just like the rest of the repo, these are just some useful utility scripts for the Backend.

```
├── cleanup-prod-database.sql       # Just an old cleanup script that I keep around for historical reasons.
├── create-stripe-webhook.js        # Helper script for creating Stripe webhooks in the build pipeline (for per-branch namespaces).
├── db-migrate.js                   # Hacky workaround script for invoking the db:migrate npm script in the prod image.
├── db-reset.js                     # Same as ^ but for db:reset.
├── delete-stripe-webhook.js        # Helper script for cleaning up Stripe webhooks in the build pipeline (for per-branch namespaces).
├── retryable-db-migrate.sh         # The original wrapper script around db:migrate for waiting and retrying until the database comes up.
└── setup-stripe-account.js         # Script for setting up a brand new Stripe account. Only need to run this once.
```
