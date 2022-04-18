import crypto from "isomorphic-webcrypto";
import {CryptoPrimitives, E2ECrypto, StringEncoder} from "./crypto";

// Increase timeout since the crypto functions can take a while to run, which is further
// worsened when running the CI pipeline in parallel.
jest.setTimeout(60000);

describe("E2ECrypto", () => {
    const userId = "user-123";

    // Note: This is _not_ a good password!
    const password = "password 123";

    const initCrypto = async (initPassword = password) => {
        // Gotta generate the keys first.
        const {edek, kekSalt} = await E2ECrypto.generateKeysForNewUser(password);

        // Initialize the module.
        const crypto = new E2ECrypto();
        await crypto.init(edek, kekSalt, initPassword, userId);

        return crypto;
    };

    describe("generateKeysForNewUser", () => {
        it("can generate keys for a new user", async () => {
            const {edek, kekSalt} = await E2ECrypto.generateKeysForNewUser(password);

            expect(typeof edek).toBe("string");
            expect(typeof kekSalt).toBe("string");
        });
    });

    describe("changeKeysForUser", () => {
        const newPassword = "abc 123";

        it("can change the keys for a user", async () => {
            const {edek, kekSalt} = await E2ECrypto.generateKeysForNewUser(password);

            const oldKEK = await CryptoPrimitives.generateKEK(
                password,
                StringEncoder.decodeBase64ToBuffer(kekSalt)
            );

            const dek = await CryptoPrimitives.unwrapDEK(edek, oldKEK, {extractable: true});
            const rawDEK = await crypto.subtle.exportKey("raw", dek);
            const encodedDEK = StringEncoder.encodeBufferToBase64(rawDEK);

            const {edek: newEDEK, kekSalt: newKEKSalt} = await E2ECrypto.changeKeysForUser(
                password,
                newPassword,
                edek,
                kekSalt
            );

            const newKEK = await CryptoPrimitives.generateKEK(
                newPassword,
                StringEncoder.decodeBase64ToBuffer(newKEKSalt)
            );

            const sameDEK = await CryptoPrimitives.unwrapDEK(newEDEK, newKEK, {extractable: true});
            const sameRawDEK = await crypto.subtle.exportKey("raw", sameDEK);
            const sameEncodedDEK = StringEncoder.encodeBufferToBase64(sameRawDEK);

            expect(encodedDEK).toBe(sameEncodedDEK);
        });
    });

    describe("init", () => {
        it("can initialize the keys for the module", async () => {
            const crypto = await initCrypto();

            expect(crypto.dek).not.toBeUndefined();
            expect(crypto.userId).toBe(userId);
        });

        it("throws an error when the password is incorrect", async () => {
            await expect(initCrypto("wrong password")).rejects.toThrow();
        });
    });

    describe("encrypt/decrypt", () => {
        const edek = "ehspFv/vT4zJtdWpTr/2KmKmXJOdOL8UE9aNg/fV6M2A6wBDY/OxhA==";
        const kekSalt = "1nRqUy5TnOSGVsL5UO8hHQ==";

        const plaintext = "testing testing 123";
        const knownCiphertext = "V1p8CHT8Mk6CFKM7:/KTKJ9ajKHp0oOMdfKP7OFPHIs47RmqFfDSh/AkK62QOd4w=";

        const init = async () => {
            const crypto = new E2ECrypto();
            await crypto.init(edek, kekSalt, password, userId);

            return crypto;
        };

        it("can encrypt and decrypt a value", async () => {
            const crypto = await init();

            const ciphertext = await crypto.encrypt(plaintext);
            expect(ciphertext).not.toBe(plaintext);

            const decryptedPlaintext = await crypto.decrypt(ciphertext);
            expect(decryptedPlaintext).toBe(plaintext);
        });

        it("can decrypt a known ciphertext", async () => {
            const crypto = await init();

            const decryptedPlaintext = await crypto.decrypt(knownCiphertext);
            expect(decryptedPlaintext).toBe(plaintext);
        });

        it("throws an error when the keys aren't initialized", async () => {
            const crypto = new E2ECrypto();

            await expect(crypto.encrypt(plaintext)).rejects.toThrow();
            await expect(crypto.decrypt(knownCiphertext)).rejects.toThrow();
        });
    });
});
