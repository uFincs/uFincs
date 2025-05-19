import {createInstance, INDEXEDDB, LOCALSTORAGE} from "localforage";

// We need the localForage instance declared in its own file so that the Cypress tests can pick out
// just it without having to go through a file that references a `services/` import (as storage.ts does).
//
// This is due to Cypress failing to compile the whole `services/` folder, cause of something or another.
// Something to do with how the Cypress TypeScript config doesn't like the absolute imports we use.
// It's just a problem I keep running into over and over that I keep working around.

const localForageInstance = createInstance({
    // Prefer IndexedDB but fallback to Local Storage when not available.
    // AKA, in Firefox Private Browsing mode.
    driver: [INDEXEDDB, LOCALSTORAGE],
    name: "ufincs-redux",
    version: 1,
    storeName: "ufincs"
});

export default localForageInstance;
