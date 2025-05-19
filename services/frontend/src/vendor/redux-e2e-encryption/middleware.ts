import {createAction} from "@reduxjs/toolkit";
import {Middleware} from "redux";
import {E2ECrypto} from "./crypto";
import {EncryptionSchema, FieldsSchema} from "./schema";
import {WorkerPool} from "./workerPool";

const ACTION_BASE = "redux-e2e-encryption";

interface LoginPayload {
    edek: string;
    kekSalt: string;
    password: string;
    userId: string;
}

interface InitPayload {
    userId: string;
}

export const actions = {
    // Action to 'login' the user with the encryption middleware. Provides the middleware
    // with the information to derive the user's encryption keys.
    login: createAction<LoginPayload>(`${ACTION_BASE}/LOGIN`),

    // Emitted when the `login` action is successful.
    loginSuccess: createAction<void>(`${ACTION_BASE}/LOGIN_SUCCESS`),

    // Emitted when the `login` action has failed (e.g. password is wrong).
    loginFailure: createAction<void>(`${ACTION_BASE}/LOGIN_FAILED`),

    logout: createAction<void>(`${ACTION_BASE}/CLEAR_STORAGE`),

    initFromStorage: createAction<InitPayload>(`${ACTION_BASE}/INIT_FROM_STORAGE`),
    initFromStorageSuccess: createAction<void>(`${ACTION_BASE}/INIT_FROM_STORAGE_SUCCESS`),
    initFromStorageFailure: createAction<void>(`${ACTION_BASE}/INIT_FROM_STORAGE_FAILURE`)
};

/** Creates the encryption middleware that can be registered on a Redux store. */
export const createEncryptionMiddleware = (schema: FieldsSchema): Middleware => {
    EncryptionSchema.validateSchema(schema);

    const workerPool = new WorkerPool();

    return (_store) => (next) => async (action) => {
        if (action?.type === actions.login.type) {
            // Keep the action moving down the middleware chain, in case someone else wants
            // to do something with it down the line.
            next(action);

            const {
                edek = "",
                kekSalt = "",
                password = "",
                userId = ""
            } = action?.payload as LoginPayload;

            try {
                await workerPool.initSchema(schema);
                await workerPool.initKeys(edek, kekSalt, password, userId);

                return next(actions.loginSuccess());
            } catch {
                // This will happen if the key initialization fails for any reason.
                // Most likely reasons are: wrong password, wrong salt, or wrong EDEK.
                // For the salt and EDEK, "wrong" really means "maliciously modified" or
                // "corrupted".
                return next(actions.loginFailure());
            }
        } else if (action?.type === actions.initFromStorage.type) {
            next(action);

            const {userId = ""} = action?.payload as InitPayload;

            try {
                await workerPool.initSchema(schema);
                await workerPool.initKeysFromStorage(userId);

                return next(actions.initFromStorageSuccess());
            } catch {
                // This will happen if the key initialization fails for some reason.
                // Most likely reasons are: DEK or user ID aren't in storage, or the stored user ID
                // is different from the payload's user ID.
                return next(actions.initFromStorageFailure());
            }
        } else if (action?.type === actions.logout.type) {
            await E2ECrypto.clearStorage();
            return next(action);
        }

        // We are reserving the `encrypt` and `decrypt` meta tags for our middleware.
        const payloadFormat = action?.meta?.encrypt || action?.meta?.decrypt;

        if (payloadFormat) {
            const method = action?.meta?.encrypt ? "encrypt" : "decrypt";
            const originalPayload = action?.payload;

            // Create a copy of the action so that we're not modifying the original.
            // Otherwise, some _weird_ stuff starts happening.
            const actionCopy = JSON.parse(JSON.stringify(action));

            let newPayload;

            try {
                newPayload = await workerPool[method](originalPayload, payloadFormat);

                // Attach the encrypted/decrypted payload under the payload key.
                actionCopy.payload = newPayload;
            } catch (e) {
                console.error(e);

                actionCopy.error = true;

                // Set the payload as the error 'object'. This is by convention for FSA.
                // For reference: https://github.com/redux-utilities/flux-standard-action#error.
                actionCopy.payload = {
                    message: `Failed to ${method} some data. Please contact support if this error persists.`
                };
            }

            // Remove the encrypt/decrypt tag so that the action can't accidentally cycle
            // through this middleware again and cause an infinite loop.
            actionCopy.meta[method] = undefined;

            // Re-attach the payload format under a separate tag for logging purposes.
            // This isn't currently used for anything; it just makes Redux monitoring easier.
            actionCopy.meta.payloadFormat = payloadFormat;

            // Attach the original payload back on as a meta tag, in case it needs to be used down
            // the line.
            actionCopy.meta.originalPayload = originalPayload;

            return next(actionCopy);
        } else {
            return next(action);
        }
    };
};
