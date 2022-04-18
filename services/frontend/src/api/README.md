# Feathers API

This is the client for the Backend Feathers API. Need to do a number of hacks/modifications to get it to work how we need.

```
├── apiErrors.ts
├── api.ts              # The main API setup.
├── auth.ts             # Extra helper functions for dealing with authentication.
├── billing.ts          # Fetch bindings over the custom Billing service.
├── bindServices.ts     # A hack for getting Feathers API calls to work in redux-saga.
├── feathers.d.ts       # Override for Feathers' types to use our own.
└── feathers.types.ts   # Our own custom types for the API client.
```
