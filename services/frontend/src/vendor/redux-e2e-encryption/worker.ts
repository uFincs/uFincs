import {E2ECrypto, Base64String, RawString} from "./crypto";
import {FieldsSchema, PayloadApplier} from "./schema";

// This is the file that specifies how the Web Worker functions.
// Each exported async function can be called individually.
//
// The reason we're using async functions as an interface as opposed to the usual Web Worker
// message system is because we're using the `workerize-loader` package. Makes it much
// easier to interact with workers by using promises instead of the message system.

const crypto = new E2ECrypto();
let payloadApplier: PayloadApplier | undefined = undefined;

export async function initSchema(schema: FieldsSchema) {
    payloadApplier = new PayloadApplier(schema);
}

export async function initKeys(
    encodedEDEK: Base64String,
    encodedKEKSalt: Base64String,
    password: RawString,
    userId: RawString
) {
    await crypto.init(encodedEDEK, encodedKEKSalt, password, userId);
}

export async function initKeysFromStorage(userId: RawString) {
    await crypto.initFromStorage(userId);
}

export async function encrypt(payload: any, payloadFormat: string) {
    if (!payloadApplier) {
        throw new Error("Crypto worker was not initialized before usage.");
    }

    return payloadApplier.applyToPayload(payload, payloadFormat, crypto.encrypt.bind(crypto));
}

export async function decrypt(payload: any, payloadFormat: string) {
    if (!payloadApplier) {
        throw new Error("Crypto worker was not initialized before usage.");
    }

    const decrypted = await payloadApplier.applyToPayload(
        payload,
        payloadFormat,
        crypto.decrypt.bind(crypto)
    );

    return payloadApplier.convertStringsToTypes(decrypted, payloadFormat);
}
