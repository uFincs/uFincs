# redux-e2e-encryption

This is the heart and soul of uFincs' entire cryptographic system. It's actually quite well encapsulated, which is mostly a byproduct of it being introduced fairly late in uFincs' development.

Here's how it works:

-   You have `crypto.ts` which has all of the main cryptographic operations — generating keys, encrypting/decrypting data, etc.
-   Then there's `schema.ts` (poorly named, in retrospect). It handles applying the cryptographic operations to objects that match a certain schema using the so-called `PayloadApplier` ('payload' because Redux actions).
-   `worker.ts` and `workerPool.ts` handle actually making the calls to the `crypto.ts` and `schema.ts` functions. The worker pool leverages Web Workers to parallelize the operations.
-   Finally, there's the actual redux portion of all this: `middleware.ts`. It is a Redux middleware that handles intercepting actions that have been specially marked, encrypting/decrypting their payloads (through the worker pool), and the sending the action on its way. This is what handles decrypting response data from the Backend or encrypting request data to be stored in the database.

Technically, the Redux portion of `redux-e2e-encryption` is actually quite small; the rest of its parts can basically act as a standalone abstraction over WebCrypto.

From the POV of uFincs's consumption of this 'package', the only thing it really needs to do is register the Redux middleware, declare a schema for the `PayloadApplier`, and mark the right actions as needing encryption or decryption (using `EncryptionSchema`).

Of course, the database tables also need to be designed to accomodate hosting encrypted data. Which basically just means using `TEXT` for all fields, _including_ the date fields (i.e. `createdAt`, `updatedAt`). Since encrypted data is just a string, that's all we can really store. And since basically everything is encrypted, everything is just a string.
