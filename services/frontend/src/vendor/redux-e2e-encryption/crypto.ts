/* eslint no-restricted-globals: 1 */

// This a polyfill for TextEncoder/Decoder. Not because we want to support old browsers, but
// because we need it for them to work when running under Jest. Seems like JSDOM,
// the environment that Jest uses, doesn't yet support TextEncoder/Decoder.
import "fast-text-encoding";

import {createInstance, INDEXEDDB} from "localforage";

const crypto = self.crypto;

/* Terminology and Methodology */

// DEK = Data Encryption Key (encrypts user data)
// KEK = Key Encryption Key (encrypts the DEK)
// KEK Salt = Salt for the KEK (used to derive the KEK as part of the PBKDF2 key derivation)
// EDEK = Encrypted DEK (the result of the DEK encrypted by the KEK)

// For our e2e (client side) encryption, we're using the following methodology:
//
// User data (fields of objects) is encrypted by the DEK. This DEK is randomly generated when a
// user signs up.
//
// This DEK is then encrypted by the KEK. The KEK is derived from the user's password and a salt.
// This 'KEK Salt' is also generated at user sign up and is random + unique.
// The encrypted DEK is known as the EDEK.
//
// The EDEK and KEK salt get stored in the database and are retrieved when the user logs in.
// When the user logs in, the KEK is re-derived from the user's password and KEK salt to decrypt
// the EDEK. This gets us back the DEK. The DEK can then be used to encrypt/decrypt user data.
//
// The KEK should never be stored in the database or anywhere else. Same with the raw DEK.
//
// The reason to have this separate DEK/KEK scheme is so that if/when users change their password,
// the password change only results in changing the KEK and re-encrypting the DEK. By doing this,
// we don't have to re-encrypt all of the user's data using their new password.
//
// For more information on this methodology, see https://security.stackexchange.com/a/166291 and
// https://security.stackexchange.com/a/157426.

/* Types */

// The following types don't really add any type information from TypeScript's perspective;
// they just add extra information for the programmer to know what formats strings should be in.

// 'Raw' strings are any strings provided from a user (e.g. their password or data of theirs
// that we want to encrypt).
//
// Note: 'Raw' in this context should not be confused with the concept of the 'raw' export format
//       for keys.
export type RawString = string;

// Cryptographic keys and ciphertexts are represented as ArrayBuffers (Uint8Array) in JavaScript,
// but we encode them to base64 for data transfer/storage.
export type Base64String = string;

// When we encrypt a plaintext into a ciphertext, a unique IV (initialization vector) is generated
// as part of the encryption process to ensure that encrypting the same plaintext multiple times
// doesn't result in the same ciphertext. In order to decrypt the ciphertext back to the plaintext,
// we need the IV again.
//
// As such, the IV and ciphertext are stored together in one string; each part is base64 encoded
// then they are concatenated together with a colon (":") in between. Why a colon? Because it
// isn't a valid base64 character.
//
// As such, a string of format IVAndCiphertext should look like `${iv}:${ciphertext}`.
type IVAndCiphertext = string;

/* Setup */

// Need these encoders for turning raw strings into ArrayBuffers for certain cryptographic
// operations (e.g. turning passwords into ArrayBuffer for key derivation).
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/* Crypto Params */

const CRYPTO_PARAMS = {
    // When exporting keys (for storage in the Backend database, for example), we want to export
    // in the 'raw' format, which is a Uint8Array in JavaScript. Obviously, we can't directly
    // store an ArrayBuffer in our database, so all exported key values are encoded in Base64.
    //
    // Base64 encoding is also used for anything else that would (internally) be represented
    // as an ArrayBuffer, such as encrypted text.
    exportFormat: "raw",

    keyDerivation: {
        // PBKDF2 is the only (good) key derivation function available in WebCrypto.
        // Obviously, something like bcrypt or Argon2 would be better, but PBKDF2 is
        // recommended by NIST for key generation (https://security.stackexchange.com/a/15091),
        // and with enough iterations it should be fine.
        algorithm: "PBKDF2",

        // Use SHA-256 so that we get a 256 bit hash. This then matches up directly with AES
        // since we're using a 256 key length for it.
        hash: "SHA-256",

        // To the best of my knowledge, https://security.stackexchange.com/a/110106 is the
        // best answer I could find for how many iterations to use for PBKDF2 in 2020: 400,000.
        // However, after doing some tuning, I settled on 1,000,000 iterations, which lands us
        // at between 500ms and 1s for a fairly powerful desktop/laptop. Is that too much for a
        // mobile device? Yet to be seen...
        //
        // Also, because I've seen multiple references to an old OWASP password cheat sheet
        // (e.g. https://security.stackexchange.com/a/15091) that suggested 64,000 in 2012
        // and doubling every 2 years, which conveniently puts us at just over 1,000,000 in 2020.
        iterations: 1000000
    },

    keyWrap: {
        // The reason to use AES-KW over some other mode like AES-GCM is that AES-KW doesn't
        // require an initialization vector (IV):
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/wrapKey#AES-KW
        //
        // This is good, because that's one less salt/IV we need to store/keep track of.
        algorithm: "AES-KW",

        // 256 is the max key length for AES under WebCrypto, so that's what we're going with.
        keyLength: 256
    },

    symmetric: {
        // AES-GCM is the classic AES running in GCM mode. GCM means that it is authenticated
        // encryption with additional data (AEAD). tl;dr this means we get data integrity without
        // having to use a separate HMAC and the additional data just adds an extra layer of
        // protection against the ciphertexts being used in the wrong contexts. In our case,
        // the additional data is just the user's ID.
        algorithm: "AES-GCM",

        // 256 is the max key length for AES under WebCrypto, so that's what we're going with.
        keyLength: 256
    }
} as const;

const localForageInstance = createInstance({
    driver: INDEXEDDB,
    name: "redux-e2e-encryption",
    version: 1,
    storeName: "keys"
});

/* Public Interface */

/** This is the public interface for the crypto module. It enables end-users to generate
 *  keys for a new user, derive keys for existing users, and encrypt/decrypt information. */
export class E2ECrypto {
    /** The key used to encrypt user data. */
    dek: CryptoKey | undefined;

    /** The UUID of the user. Used as additional data during the encryption process. */
    userId: RawString;

    constructor() {
        this.dek = undefined;
        this.userId = "";
    }

    /** Checks if the storage engine (in this case, IndexedDB) is available for use.
     *
     *  This must be done before _any_ access to the storage (through localForage). Otherwise,
     *  errors will definitely be flying.
     *
     *  By always checking if we have access to the storage, we can at least degrade gracefully
     *  when we don't. This way, users can _at least_ login and use the app. They just won't be able
     *  to refresh the page, since they won't have their keys stored in IndexedDB to init from. */
    public static async isStorageAvailable() {
        if (typeof indexedDB === "undefined") {
            return new Promise((resolve) => resolve(false));
        }

        // Checking if just opening a random DB throws an error is enough to rule out whether this
        // browser supports IndexedDB or not.
        //
        // General idea taken from https://bugzilla.mozilla.org/show_bug.cgi?id=781982.
        const db = indexedDB.open("test123");

        return new Promise((resolve) => {
            db.onsuccess = () => {
                resolve(true);
            };

            db.onerror = () => {
                resolve(false);
            };
        });
    }

    /** This allows external consumers to clear the key storage without having an instance of the
     *  class. This is particularly useful for the `middleware`, since it can clear the storage without
     *  having to ask one of the Web Workers to do it. */
    public static async clearStorage(): Promise<void> {
        if (await E2ECrypto.isStorageAvailable()) {
            await localForageInstance.clear();
        }
    }

    /** Fills the storage with the given DEK and User ID.
     *
     *  This is just used in the e2e tests, since we need to be able to manually authenticate a user
     *  to make testing easier.
     *
     *  It really shouldn't be used for any other purposes. */
    public static async fillStorage(dek: CryptoKey, userId: RawString): Promise<void> {
        if (await E2ECrypto.isStorageAvailable()) {
            await localForageInstance.setItem("dek", dek);
            await localForageInstance.setItem("userId", userId);
        }
    }

    /** Retrieves the crypto info from storage.
     *
     *  Should return nothing for the DEK/User ID when they don't exist in storage, or the storage
     *  is unavailable, so that we can prompt the user to be logged in again. */
    public static async getFromStorage() {
        if (await E2ECrypto.isStorageAvailable()) {
            const dek = (await localForageInstance.getItem("dek")) as CryptoKey | undefined;
            const existingUserId = (await localForageInstance.getItem("userId")) as
                | string
                | undefined;

            return {dek, existingUserId};
        } else {
            return {};
        }
    }

    /** Generates the keys for a new user using their password. This function can be called
     *  standalone (statically) since it's not part of the middleware.
     *
     *  The resulting EDEK and KEK salt should be stored and retrieved whenever
     *  the user logs in. */
    public static async generateKeysForNewUser(password: RawString): Promise<{
        edek: Base64String;
        kekSalt: Base64String;
    }> {
        const kekSalt = await CryptoPrimitives.generateKEKSalt();
        const kek = await CryptoPrimitives.generateKEK(password, kekSalt);

        const dek = await CryptoPrimitives.generateDEK();
        const edek = await CryptoPrimitives.wrapDEK(dek, kek);

        return {
            edek,
            kekSalt: StringEncoder.encodeBufferToBase64(kekSalt)
        };
    }

    /** Takes a user's existing EDEK and password and wraps it with a new KEK generated by
     *  their new password. */
    public static async changeKeysForUser(
        oldPassword: RawString,
        newPassword: RawString,
        encodedEDEK: Base64String,
        encodedKEKSalt: Base64String
    ): Promise<{
        edek: Base64String;
        kekSalt: Base64String;
    }> {
        const oldKEKSalt = StringEncoder.decodeBase64ToBuffer(encodedKEKSalt);
        const oldKEK = await CryptoPrimitives.generateKEK(oldPassword, oldKEKSalt);

        const dek = await CryptoPrimitives.unwrapDEK(encodedEDEK, oldKEK, {extractable: true});

        const newKEKSalt = await CryptoPrimitives.generateKEKSalt();
        const newKEK = await CryptoPrimitives.generateKEK(newPassword, newKEKSalt);

        const edek = await CryptoPrimitives.wrapDEK(dek, newKEK);

        return {
            edek,
            kekSalt: StringEncoder.encodeBufferToBase64(newKEKSalt)
        };
    }

    /** Initializes an E2ECrypto instance with a user's keys, to get the instance ready
     *  for encrypting/decrypting user data. */
    public async init(
        encodedEDEK: Base64String,
        encodedKEKSalt: Base64String,
        password: RawString,
        userId: RawString
    ): Promise<void> {
        const kekSalt = StringEncoder.decodeBase64ToBuffer(encodedKEKSalt);
        const kek = await CryptoPrimitives.generateKEK(password, kekSalt);

        try {
            this.dek = await CryptoPrimitives.unwrapDEK(encodedEDEK, kek);
            this.userId = userId;

            await E2ECrypto.fillStorage(this.dek, this.userId);
        } catch (_e) {
            throw new Error("Invalid password");
        }
    }

    /** Skips generating the keys from the user's password and just retrieves them from storage instead.
     *
     *  The User ID must be provided so that we can check that the keys in storage actually belong to
     *  the right user; allowing users to accidentally access other users' keys would be quite bad. */
    public async initFromStorage(userId: RawString): Promise<void> {
        const {dek, existingUserId} = await E2ECrypto.getFromStorage();

        if (!dek || !existingUserId) {
            throw new Error("Encryption keys not present in storage");
        } else if (existingUserId !== userId) {
            throw new Error("Encryption keys are for a different user");
        } else {
            this.dek = dek;
            this.userId = existingUserId;
        }
    }

    /** Encrypt a plaintext. */
    public async encrypt(plaintext: RawString): Promise<Base64String> {
        if (!this.dek) {
            throw new Error("DEK does not exist; did you call init(password)?");
        }

        return CryptoPrimitives.encrypt(this.dek, this.userId, plaintext);
    }

    /** Decrypt a ciphertext. */
    public async decrypt(ciphertext: Base64String): Promise<RawString> {
        if (!this.dek) {
            throw new Error("DEK does not exist; did you call init(password)?");
        }

        // Note: We need to check for the string "null" here since the PayloadApplier always
        // passes in the ciphertext as a string, even if it's literally `null`.
        // We technically don't have a use case where the ciphertext could be passed in as literal `null`,
        // but no harm in checking for it.
        if (ciphertext === "null" || ciphertext === null) {
            // This handles the case where a database field is set to NULL as a default value.
            // Note that the string "null" will be converted back into a proper `null` as part
            // of `PayloadApplier.convertStringsToTypes`.
            return "null";
        }

        return CryptoPrimitives.decrypt(this.dek, this.userId, ciphertext);
    }
}

/* Business Logic */

/** Utility class for encoding strings into/from various formats. */
export class StringEncoder {
    /** Encode a raw string into an ArrayBuffer of UTF-8 bytes.
     *  This is necessary to convert various pieces of user data (e.g. password, user ID)
     *  into a form that the crypto functions expect. */
    public static encodeRawStringToBuffer(rawString: RawString): Uint8Array {
        return encoder.encode(rawString);
    }

    /** Decodes an ArrayBuffer of UTF-8 bytes into a raw string.
     *  This is used to turn decrypted plaintext back into a string. */
    public static decodeBufferToRawString(rawBuffer: ArrayBuffer): RawString {
        return decoder.decode(rawBuffer);
    }

    /** Encodes an ArrayBuffer into a base64 encoded string.
     *  This is used for converting keys, salts, and ciphertexts into strings that can be stored
     *  in a database. */
    public static encodeBufferToBase64(rawBuffer: ArrayBuffer): Base64String {
        // Taken from: https://coolaj86.com/articles/typedarray-buffer-to-base64-in-javascript/
        const typedBuffer = new Uint8Array(rawBuffer);

        // Use `map` like this because calling `typedBuffer.map` always results in a new
        // TypedArray, whereas we want to create an array of strings.
        const rawString = Array.prototype.map
            .call(typedBuffer, (charCode) => String.fromCharCode(charCode))
            .join("");

        return btoa(rawString);
    }

    /** Decodes a base64 string back into an ArrayBuffer.
     *  This is used for converting keys, salts, and ciphertexts from strings back into buffers
     *  that can be used by the crypto functions. */
    public static decodeBase64ToBuffer(base64String: Base64String): Uint8Array {
        // Taken from: https://coolaj86.com/articles/typedarray-buffer-to-base64-in-javascript/
        const rawString = atob(base64String);

        const typedBuffer = new Uint8Array(rawString.length);

        Array.prototype.forEach.call(rawString, (charCode, index) => {
            typedBuffer[index] = charCode.charCodeAt(0);
        });

        return typedBuffer;
    }

    /** Combines an IV and a ciphertext into a single string for convenient storage. */
    public static combineIVAndCiphertext(
        iv: ArrayBuffer,
        ciphertext: ArrayBuffer
    ): IVAndCiphertext {
        const encodedIV = StringEncoder.encodeBufferToBase64(iv);
        const encodedCiphertext = StringEncoder.encodeBufferToBase64(ciphertext);

        return `${encodedIV}:${encodedCiphertext}`;
    }

    /** Splits an IV and a ciphertext out into separate strings for crypto functions. */
    public static splitIVAndCiphertext(ivAndCiphertext: IVAndCiphertext): {
        iv: Uint8Array;
        ciphertext: Uint8Array;
    } {
        const [encodedIV, encodedCiphertext] = ivAndCiphertext.split(":");

        return {
            iv: StringEncoder.decodeBase64ToBuffer(encodedIV),
            ciphertext: StringEncoder.decodeBase64ToBuffer(encodedCiphertext)
        };
    }
}

/** A set of functions that wrap the cryptographic primitives provided by WebCrypto. */
export class CryptoPrimitives {
    /** Generates a 128-bit salt (random, unique value) that is used during the KEK derivation. */
    public static async generateKEKSalt(): Promise<Uint8Array> {
        // 16 bytes = 128-bit salt.
        return crypto.getRandomValues(new Uint8Array(16));
    }

    /** Generates the KEK for a user using their password and salt that was generated at signup. */
    public static async generateKEK(password: RawString, salt: Uint8Array): Promise<CryptoKey> {
        const keyMaterial = await crypto.subtle.importKey(
            CRYPTO_PARAMS.exportFormat,
            StringEncoder.encodeRawStringToBuffer(password),
            CRYPTO_PARAMS.keyDerivation.algorithm,
            false,
            ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
            {
                name: CRYPTO_PARAMS.keyDerivation.algorithm,
                salt,
                iterations: CRYPTO_PARAMS.keyDerivation.iterations,
                hash: CRYPTO_PARAMS.keyDerivation.hash
            },
            keyMaterial,
            {name: CRYPTO_PARAMS.keyWrap.algorithm, length: CRYPTO_PARAMS.keyWrap.keyLength},
            false,
            ["wrapKey", "unwrapKey"]
        );
    }

    /** Generates the DEK for a user. It is a completely random key. */
    public static async generateDEK(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: CRYPTO_PARAMS.symmetric.algorithm,
                length: CRYPTO_PARAMS.symmetric.keyLength
            },
            // Although one might think that the DEK itself should not be exportable, it needs to /
            // be exportable to work with `wrapKey`, which is just the `exportKey` and
            // `encrypt` operations.
            true,
            ["encrypt", "decrypt"]
        );
    }

    /** Wraps a DEK in a KEK to get the EDEK that can be stored. */
    public static async wrapDEK(dek: CryptoKey, kek: CryptoKey): Promise<Base64String> {
        const edek = await crypto.subtle.wrapKey(
            CRYPTO_PARAMS.exportFormat,
            dek,
            kek,
            CRYPTO_PARAMS.keyWrap.algorithm
        );

        return StringEncoder.encodeBufferToBase64(edek);
    }

    /** Unwraps a EDEK using a KEK to get back the DEK. */
    public static async unwrapDEK(
        encodedEDEK: Base64String,
        kek: CryptoKey,
        {extractable = false} = {}
    ): Promise<CryptoKey> {
        const edek = StringEncoder.decodeBase64ToBuffer(encodedEDEK);

        return crypto.subtle.unwrapKey(
            CRYPTO_PARAMS.exportFormat,
            edek,
            kek,
            CRYPTO_PARAMS.keyWrap.algorithm,
            CRYPTO_PARAMS.symmetric.algorithm,
            // In opposition to when generating the DEK, we _don't_ want the unwrapped DEK to be extractable.
            // This is because the unwrapped DEK gets stored in browser storage for future uses.
            //
            // We can get away with only having the unwrapped DEK non-extractable because the initially
            // generated DEK (from `generateDEK`) is only very temporarily available and is never stored
            // in browser storage.
            //
            // However, we _do_ want the key extractable when we're unwrapping it when changing a user's
            // password. Otherwise... how are we going to change their KEK?
            extractable,
            ["encrypt", "decrypt"]
        );
    }

    /** Encrypts a plaintext string using a DEK and associated data (e.g. user ID). */
    public static async encrypt(
        dek: CryptoKey,
        associatedData: RawString,
        plaintext: RawString
    ): Promise<IVAndCiphertext> {
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encodedAssociatedData = StringEncoder.encodeRawStringToBuffer(associatedData);
        const encodedPlaintext = StringEncoder.encodeRawStringToBuffer(plaintext);

        try {
            const ciphertext = await crypto.subtle.encrypt(
                {
                    name: CRYPTO_PARAMS.symmetric.algorithm,
                    iv,
                    additionalData: encodedAssociatedData
                },
                dek,
                encodedPlaintext
            );

            return StringEncoder.combineIVAndCiphertext(iv, ciphertext);
        } catch (e: unknown) {
            if (
                e instanceof Error &&
                e.name === "OperationError" &&
                plaintext === "" &&
                !isChromeOrFirefox()
            ) {
                // OK, so this is a pretty hacky workaround...
                //
                // In Safari, when encrypting an empty string, it'll throw an `OperationError`
                // (i.e. the generic error thrown by the crypto functions).
                //
                // This is quite bad, considering we deal with empty strings fairly often
                // (i.e. the`notes` field on a transaction).
                //
                // As such, there's not much we can do to handle this besides catching the error
                // and changing the empty string to a string with a single space.
                //
                // Encrypting a single space works; encrypting an empty string does not. Thanks Safari.
                //
                // Note: We originally tried to check that the browser was Safari before jumping
                // here, but that check failed once we brought in Capacitor for iOS. The Capacitor
                // core plugin wouldn't work properly under a Web Worker, so we resorted to just
                // making sure we're not in Firefox or Chrome.
                //
                // Does this weaken error handling? Yes. Is it Safari's fault? Also yes.
                return await CryptoPrimitives.encrypt(dek, associatedData, " ");
            } else {
                console.error(e, "Crypto decrypt error");
                throw e;
            }
        }
    }

    /** Decrypts a ciphertext string using a DEK and associated data (e.g. user ID). */
    public static async decrypt(
        dek: CryptoKey,
        associatedData: RawString,
        ivAndCiphertext: IVAndCiphertext
    ): Promise<RawString> {
        const {iv, ciphertext} = StringEncoder.splitIVAndCiphertext(ivAndCiphertext);
        const encodedAssociatedData = StringEncoder.encodeRawStringToBuffer(associatedData);

        try {
            const plaintext = await crypto.subtle.decrypt(
                {
                    name: CRYPTO_PARAMS.symmetric.algorithm,
                    iv,
                    additionalData: encodedAssociatedData
                },
                dek,
                ciphertext
            );

            return StringEncoder.decodeBufferToRawString(plaintext);
        } catch (e: unknown) {
            if (e instanceof Error && e.name === "OperationError" && !isChromeOrFirefox()) {
                // OK, so this is a pretty hacky workaround...
                //
                // In Safari, when decrypting an empty string, it'll throw an `OperationError`
                // (i.e. the generic error thrown by the crypto functions).
                //
                // This is quite bad, considering we deal with empty strings fairly often
                // (i.e. the`notes` field on a transaction).
                //
                // As such, there isn't much more we can do than just return an empty string.
                //
                // Note: We originally tried to check that the browser was Safari before jumping
                // here, but that check failed once we brought in Capacitor for iOS. The Capacitor
                // core plugin wouldn't work properly under a Web Worker, so we resorted to just
                // making sure we're not in Firefox or Chrome.
                //
                // Does this weaken error handling? Yes. Is it Safari's fault? Also yes.
                return "";
            } else {
                console.error(e, "Crypto decrypt error");
                throw e;
            }
        }
    }
}

// While we would love to be able to check for just Safari, it ends up not working because
// of running in a Web View on mobile. Specifically, on iOS, the Web View doesn't identify itself
// as Safari, and we can't import Capacitor to check the platform because it fails to work under
// a Web Worker.
//
// The result is that Chrome and Firefox are the only browser's to get the full error handling
// experience; everything else suffers.
export const isChromeOrFirefox = () =>
    typeof navigator !== "undefined" &&
    (navigator?.userAgent?.toLowerCase()?.includes("chrome") ||
        navigator?.userAgent?.toLowerCase()?.includes("firefox"));
