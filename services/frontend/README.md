# Frontend

The Frontend service is where the bulk of application logic exists for uFincs. As a React/Redux application, it has been designed as an SPA (Single Page Application) that can work fully offline.

## Table of Contents

-   [Tech Stack](#tech-stack)
-   [File Structure](#file-structure)
-   [Running Locally for Development](#running-locally-for-development)
-   [Running Storybook](#running-storybook)
-   [Running the Native Apps](#running-the-native-apps)
-   [Other Useful Development Commands](#other-useful-development-commands)
-   [Environment Variables](#environment-variables)
-   [Important Data Flows](#important-data-flows)
-   [FAQ](#faq)

## Tech Stack

-   Language: TypeScript
-   Framework: React + Redux + redux-saga, create-react-app
-   Styling: Plain old Sass
-   Testing: Jest, Cypress, Storybook
-   Linting: ESLint, Prettier
-   Native Apps: Capacitor

## File Structure

The following is a high-level breakdown of the file structure. More detailed explanations of particulars folder can be found in most folders' README.

```
├── android/                        # Capacitor code for Android app
├── CAPACITOR_CHANGELOG.md          # Changelog for any manual tweaks that have been made to the Capacitor-generated code
├── capacitor.config.ts             # Main Capacitor config
├── cypress/                        # All of the Frontend's Cypress tests (web only)
├── cypress.json                    # Cypress config
├── Dockerfile                      # Production Dockerfile
├── Dockerfile.development          # Development Dockerfile
├── electron/                       # Capacitor code for Electron app
├── ios/                            # Capacitor code for iOS app
├── Makefile                        # Makefile for common developer commands; used by Kubails
├── package.json                    # You know what this is
├── package-lock.json               # ^ Ditto
├── postinstall.js                  # A hack for a bug in react-spring
├── public/                         # Statically accessed public assets
├── resources/                      # Some misc resources for building the Capacitor apps
├── scripts/                        # Misc scripts
├── server/                         # The Express app that serves the Frontend in production
├── src/                            # The main source code for the Frontend
|   ├── api/                        # Feathers API client
|   ├── AppRouter.tsx               # The primary router for the logged-in portion of the app
|   ├── App.tsx                     # The primary container/router for the entire app
|   ├── assets/                     # Assets (e.g. images, icons) for the app
|   ├── components/                 # All of the common components (broken down into atomic hierarchy) for the app
|   ├── config.ts                   # App-level configuration (e.g. inter-service URLs)
|   ├── hooks/                      # All of the common hooks for the app
|   ├── index.tsx                   # The canonical entrypoint into the app (which really just points to App.tsx)
|   ├── models/                     # Data models that map to database tables
|   ├── scenes/                     # Components that make up 'scenes' (e.g. pages) for the app
|   ├── services/                   # Common business logic that isn't React or model specific
|   ├── service-worker.ts           # Primary service worker configuration
|   ├── setupTests.ts               # Hacks to make things work in Jest tests
|   ├── store/                      # All of the Redux stuff; the vast majority of the brains behind the app are in here
|   ├── structures/                 # Any misc data structures that the Frontend needs that aren't backed by a database table
|   ├── styles/                     # App-wide Sass styles and design system stuff
|   ├── testData/                   # Any data that is shared by multiple test suites
|   ├── utils/                      # Misc utilities (e.g. helper functions, types, stuff I didn't know where else to put)
|   ├── values/                     # Constant values that are shared throughout the app (e.g. screen URLs)
|   └── vendor/                     # Any code/packages that have been 'vendored' (i.e. copied) into our codebase
└── tsconfig.json                   # TypeScript config
```

## Running Locally for Development

There are multiple options for running the Frontend service locally.

1. Run it using `docker-compose` (see root repo README for instructions) <- this is the recommended way
2. Run it directly using Docker
3. Run it directly using `npm`

### Docker

To run the Frontend service standalone using Docker:

```
docker build -t ufincs-frontend -f Dockerfile.development .
docker run -it --rm -p 3000:3000 ufincs-frontend
```

The Frontend will then be accessible over [localhost:3000](http://localhost:3000).

### NPM

To run the Backend service standalone using `npm`:

```
npm ci
npm start
```

The Frontend will then be accessible over [localhost:3000](http://localhost:3000).

## Running Storybook

The Frontend's Storybook can also be run standalone.

### Docker

To run the Frontend service standalone using Docker:

```
docker build -t ufincs-frontend -f Dockerfile.development .
docker run -it --rm -p 9009:9009 ufincs-frontend npm run storybook
```

Storybook will then be accessible over [localhost:9009](http://localhost:9009).

### NPM

To run the Backend service standalone using `npm`:

```
npm ci
npm run storybook
```

Storybook will then be accessible over [localhost:9009](http://localhost:9009).

## Running the Native Apps

Please note: The native apps are included for convenience only. They are not 'officially' supported and thus might not work correctly.

The following are instructions for how to run the Frontend as an Android, iOS, or Electron app using Capacitor.

First have the main deps installed using `npm ci`.

### Running Android

1. Run `npx cap update android` to update Android plugins.
2. Run `npm run cap:build:local` to build the static assets.
3. Run `npm run cap:run:android` to run uFincs in an Android emulator.
4. Run `npm run cap:ports:android` to forward Backend ports to the emulator.

### Running iOS

1. Run `npx cap update ios` to update iOS plugins.
2. Run `npm run cap:build:local` to build the static assets.
3. Run `npm run cap:run:ios` to run uFincs in an iOS simulator.

### Running Electron

1. Run `npm ci` in the `electron/` folder.
2. Run `npx cap update electron` to update Electron plugins.
3. Run `npm run cap:build:local` to build the static assets.
4. Run `npm run cap:run:electron` to run uFincs in Electron.

## Other Useful Development Commands

Linting:

```
make lint
```

Testing:

```
make test
```

Everything used in the build pipeline:

```
make ci
```

### Running Cypress Tests

See the [Cypress README](./cypress/README.md) for detailed instructions on how to run the Cypress test suite.

## Environment Variables

Note: There are no 'secret' values (i.e. there is no `.env.encrypted` file) for the Frontend for... obvious reasons.

The following are the environment variables that should be passed in when running the Frontend in production mode (i.e. using the Express server in `server/`):

-   `BACKEND_HOST`: Just the hostname for the Backend service (e.g. `backend.ufincs.com`)
-   `BACKEND_PORT`: The port for the Backend service (e.g. `5000`)
-   `MARKETING_HOST`: Just the hostname for the Marketing service (e.g. `ufincs.com`)
-   `MARKETING_PORT`: The port for the Marketing service (e.g. `3002`)

Alternatively, if you choose to serve the Frontend as a static bundle rather than through the Express server, you can provide the following environment variables at build to replicate the same behaviour:

-   `REACT_APP_BACKEND_HOST`
-   `REACT_APP_BACKEND_PORT`
-   `REACT_APP_BACKEND_PROTOCOL`
-   `REACT_APP_MARKETING_HOST`
-   `REACT_APP_MARKETING_PORT`
-   `REACT_APP_MARKETING_PROTOCOL`

These bundle-time vars are particularly useful for the Native apps, since they do serve the Frontend as a static bundle.

Note: You can specify the protocol when bundling but not when serving with Express. This is because it's assumed that anything that isn't `localhost` is served over HTTPS.

Note 2: Due to service worker requirements, it is practically required that the Frontend service is served over HTTPS when running on anything that isn't `localhost`. Otherwise, you'll run into a host of issues.

## Important Data Flows

The following are various important data flows that show how the Frontend works.

### Initial Data Fetch (aka "The App Boot Process")

The app boot process (where the user's data is fetched all at once) demonstrates some of the most important aspects of the Frontend. Primarily, how most functionality is driven through Redux and sagas. The app boot process works as follows (all file paths start in `src/`):

1. The app is started in `index.tsx`. This renders the main React app (`App.tsx`) into the `root` DOM element.
2. `App.tsx` creates the react-redux `Provider`, passing in the `store` from `store/store.ts`.
3. `store/store.ts` creates the initial Redux state, along with registering the app's sagas (`store/sagas/index.ts`)
    - One of those registered sagas is `store/sagas/app.sagas.ts`. This has the code for the app boot process.
4. The `watchAppBoot` saga is fired as soon as the sagas are registered. It waits for one of three things to happen before triggering the app boot process:
    - A route change occurs.
    - The user logs in (with an account).
    - The user logs in (without an account).
5. Assuming the user logs in with an account (the base case), the `appBoot` saga starts. This saga does a number of things, but let's stick to the stuff relevant for data fetching.
6. First, the `appBoot` saga initializes the encryption subsystem. It does this by emitting an action (`encryptionSlice.actions.initAtAppBoot`) for `store/sagas/encryption.sagas.ts`.
7. The `initAtAppBoot` encryption saga emits another action (`encryptionActions.initFromStorage`) to tell `vendor/redux-e2e-encryption/middleware.ts` to initialize.
8. The middleware goes through the process of loading the encryption keys from storage (these were already loaded by `store/sagas/auth.sagas.ts` emitting `encryptionActions.login` action).
9. Once the encryption keys are loaded, the `appBoot` saga then starts the process of fetching the user's data from the Backend. It emits a series actions: a `request` action for each of the different data model slices. Let's use 'accounts' as an example.
10. The `accountsRequestsSlice.fetchAll.actions.request` action is emitted.
11. This action is caught by the `accountsRequestSlice.fetchAll.watchCommitSaga` saga that is forked off in `store/sagas/accounts.saga.ts`.
12. This saga is actually defined as a wrapper saga in `store/utils/createOfflineRequestSlices.ts`: `_generateWatchCommitSaga`.
13. The wrapper saga sees that no saga was registered for the `commit` stage and emits an `OfflineRequestManager.enqueue` action stating that this is a fetch `effect`.
14. This enqueue action is caught by the `offlineRequestManagerSlice.processQueueSaga` that is registered in `store/sagas/offlineRequestManager.sagas.ts`. However, the actual logic for the saga is defined in `store/utils/createOfflineRequestManager.ts`, in `_generateProcessQueueSaga`.
15. In the queue process saga, the enqueued action is determined to be a fetch `effect` and emits the corresponding `effect` action (in this case, `accountsRequestSlice.fetchAll.actions.effectStart`).
16. This `effect` start action is caught by the `fetchAllEffect` saga in `accounts.sagas.ts`.
17. The `fetchAllEffect` saga _finally_ performs the actual network request to the Backend to fetch the user's accounts. In uFincs' case, this is done through the Feathers API that is defined in `api/`.
18. Once the data has been fetched, the `fetchAllEffect` saga then emits (among other things) the `accountsSlice.actions.set` action, wrapped for decryption.
19. The encryption middleware (remember, `vendor/redux-e2e-encryption/middleware.ts`) notices that the `set` action has been wrapped for decryption and intercepts the action.
20. The middleware then uses the Worker Pool (`vendor/redux-e2e-encryption/workerPool.ts`) to perform decryption on all of the data in the `set` action's payload.
21. Once all of the data is decrypted, the middleware forwards along a modified copy of the `set` action where the payload has been replaced with the decrypted data.
22. The `set` action _finally_ makes its way to the reducers, where it is picked up by the reducer defined in `store/slices/accounts.slice.ts` (part of the `crudSliceReducerFactory`). This reducer sets the decrypted account data on the Redux store.
23. The `fetchAllEffect` saga wrapper (defined as `_generateWatchEffectSaga` in `createOfflineRequestSlices.ts`) then emits the `effectSuccess` action, signalling to the `appBoot` saga that the accounts have been successfully fetched (note: strictly speaking, `effectSuccess` saga is emitted right after the `set` action is emitted, not after the reducer consumes the decrypted data).
24. The `appBoot` saga then waits for all of the _other_ data fetches to finish before finally letting the user into the app (i.e. it ends the 'loading' indicator you see on login).

Yes, this is pretty insane. The best part is that this isn't even the strictest, most comprehensive breakdown! Some details about the encryption and offline request management subsystems (among others) have been omitted for 'brevity'.

But all of it enables some pretty cool features — you know, things like the ability to encrypt/decrypt data or the ability to run the app entirely offline. The thing you have to remember is that all of it was designed with a purpose. And it kinda starts to make sense once you wrap your head around it all :)

Regardless, this data flow touches on some of the most important aspects of the Redux system: actions, slices, sagas, offline request slices, the offline request manager, and the encryption/decryption middleware.

However, you'll notice that there seems to be a distinct lack of something... nowhere in this flow are there any React components! Well, as much as uFincs is a React app, it's _really_ a Redux app. Take away all of the components, all of the fancy custom design system, and... you're still left with a Redux core that could be swapped into anything else.

But those components and fancy custom design system are integral to uFincs as a whole, so let's look at a data flow that includes some components.

### Creating Transactions (or Accounts or anything else)

Creating a Transaction demonstrates much of how uFincs works in an e2e fashion (from component to Redux and back). The same flow applies similarly to creating accounts or anything else — they all use the same building blocks. So let's start at the component level and work our way around.

1. We start in `components/organisms/TransactionForm`. Technically, we should start in `scenes/SidebarTransactionForm`, but that's more a wrapper than anything else.
2. The `TransactionForm` has a fairly significant amount of internal logic (as found in its `hooks.ts` file), but for the purposes of this flow, we only care about the data moving into and out of it — specifically with respect to Redux. All of that is defined in the `connect.ts` file.
3. Once the user has filled out the form and clicked the submit button (aka "Add Transaction"), the `onSubmit` callback is fired.
4. This callback (for the purposes of creation) then emits the `transactionsRequestsSlice.create.actions.request` action.
5. This action gets caught by the `createCommit` saga in `store/sagas/transactions.sagas.ts`. The `commit` phase of a request handles making the changes to the local Redux store. So now the new transaction gets added to the transactions slice (`store/slices/transactions.slice.ts`).
6. From here, several things happen in 'parallel':
    - The change in store state causes a cascade of selector updates. This causes components to re-render (e.g. `TransactionsTable`).
    - Various other store slices get updated (e.g. `store/slices/transactionsDateIndex.slice.ts`), causing more selectors to update.
    - The wrapper around `createCommit` emits the `OfflineRequestManager.enqueue` action.
7. That last one is the most important here. Just like with the data fetching, the enqueued action will cause an `effectStart` action (specifically, the one for `transactionsRequestSlice.create.actions`) to be emitted (assuming the `OfflineRequestManager` determines that the app is 'online').
8. Before the `effectStart` action can reach a saga, though, the encryption middleware notices that it has the `encrypt` metatag (as defined by `createOfflineRequestSlices` in `store/slices/transactions.slice.ts`) and encrypts the data payload.
9. The `effectStart` action is then passed on and caught by the `createEffect` action in `transactions.sagas.ts`, which makes the actual Feathers API call to the Backend to create and persist the transaction using the encrypted data.
10. If the `effect` is successful (i.e. it emits `effectSuccess`), the `OfflineRequestManager` dequeues it and all is well. That is basically the end of the flow.
11. However, if the `effect` throws an error and fails (i.e. it emits `effectFailure`), then the `OfflineRequestManager` will retry it three times. If all three retries fail, then the `OfflineRequestManager` will trigger a `rollback` of the effect by emitting `rollbackStart`.
12. The `rollbackStart` will be caught by the `createRollback` saga in `transactions.sagas.ts`. The saga will attempt to rollback the `commit` — i.e. it will undo the creation of the transaction from the local Redux state.
13. Once the `commit` is rolled back, the `OfflineRequestManager` will dequeue the effect from its internal queue and call it a day.
14. Of course, if the _`rollback`_ fails, then... welp, nothing we can do but show the user an error toast (through the `toasts` slice) and go ¯\\\_(ツ)\_/¯. Obviously, this shouldn't happen on a regular basis (if ever — I've personally never seen it happen in practice).

Something to note here is that, after step 6, everything that's happening is all just ancillary to the actual operations of the Frontend — once the `commit` has happened, that's all that's needed for the app to be functional. Whether or not the `effect` happens (i.e. updating the Backend's database) is literally just that — a side effect.

Local-first, offline-first, call it what you want but that's what's happening here. It's also what enables what is internally called "no-account" mode (i.e. using the app without an account) — the `store/middleware/disableRequestWhenNoAccount.ts` middleware literally just takes all of the `effect` actions (specifically, the `OfflineRequestManager.enqueue` actions) and throws them away. The app continues working perfectly fine.

Together, these two data flows demonstrate the main inner-workings of data/request handling in the Frontend. Which is like... at least 50% of everything there is to the Frontend :)

## FAQ

The following is a set of frequently asked questions.

### Why does VS Code throw error highlights in saga files?

Because I've been too lazy to upgrade the Frontend's TypeScript version.

By default, VS Code uses its own (latest) version of TypeScript for things like error highlightning, and one of the things that came in later versions of TypeScript was better type-checking around generator functions.

Well, sagas are literally just generator functions. And I've yet to update our sagas to take advantage of this better type-checking, so VS Code (aka later versions of TypeScript) complain about missing types.

As such, to make these errors 'go away' in VS Code, run the `TypeScript: Select TypeScript Version...` command and choose `Use Workspace Version`.

Note: You must have installed npm packages locally (i.e. run `npm ci` in the Frontend folder) for this to work.

Note 2: You must be editing the Frontend folder directly in VS Code for this to work (i.e. open the `services/frontend` folder in VS Code rather than the uFincs repo).

### Why can't the Android emulator connect to the (local) Backend service?

You need to forward the port for the Backend service to the emulator.

Run `npm run cap:ports:android` to forward the Backend and Marketing services.

Without doing this, the emulator has to access the services over `10.0.2.2` rather than over `localhost`.

### Why is ESLint telling me to order an internal import above an external import?

This is most likely because you added a new folder. All top-level folders (and files) that are absolutely imported from must be registered in the ESLint config (`.eslintrc`) under the `import/internal-regex` setting.

Just add `|FOLDER_NAME/` to the end of the regex to register it as an internal module.

Regex notes: The `| denotes an OR and the`/` just denotes the path separator. Doesn't seem to need to be escaped, so it should be fine as is.
