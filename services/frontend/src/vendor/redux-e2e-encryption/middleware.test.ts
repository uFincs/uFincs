import {vi, Mock} from "vitest";
import {actions, createEncryptionMiddleware} from "./middleware";
import {EncryptionSchema} from "./schema";

// Increase timeout since the crypto functions can take a while to run, which is further
// worsened when running the CI pipeline in parallel.
vi.setConfig({testTimeout: 60000});

const edek = "ehspFv/vT4zJtdWpTr/2KmKmXJOdOL8UE9aNg/fV6M2A6wBDY/OxhA==";
const kekSalt = "1nRqUy5TnOSGVsL5UO8hHQ==";
const password = "password 123";
const userId = "user-123";

const userCredentials = {edek, kekSalt, password, userId};

describe("Middleware", () => {
    const modelSchema = {
        transaction: {
            date: "string",
            description: "string"
        }
    } as const;

    const mockStore = {
        dispatch: (_value: any): any => {},
        getState: (): any => {}
    };

    // I don't bloody know what happened, but... previously, the `next` mock was declared at the
    // top-level (aka where this comment is), but sometime down the line, after who knows what Jest
    // updates, it just stopped working. The mock just stopped working. Like, it'd record that it
    // had been called, but it would never output anything. It wouldn't have any results, the
    // passed 'implementation' function is never called, shit just didn't work. I don't know why.
    //
    // Anyways, super duper TECH DEBT hack: if we re-create the mock for every test and re-assign
    // it in `beforeEach`, seems to work fine. ¯\_(ツ)_/¯
    const createMiddleware = () => {
        const next = vi.fn((x) => x);
        const middleware = createEncryptionMiddleware(modelSchema)(mockStore)(next);

        return {next, middleware};
    };

    let middleware: (action: any) => any, next: Mock;

    beforeEach(() => {
        const result = createMiddleware();

        middleware = result.middleware;
        next = result.next;
    });

    describe("Login Actions", () => {
        it("can login with a user's credentials", async () => {
            const action = actions.login(userCredentials);
            const result = await middleware(action);

            expect(next).toHaveBeenCalledWith(action);
            expect(next).toHaveBeenCalledWith(actions.loginSuccess());
            expect(result).toEqual(actions.loginSuccess());
        });

        it("can fail to login if the user's credentials are invalid", async () => {
            const action = actions.login({...userCredentials, password: "wrong password"});
            const result = await middleware(action);

            expect(next).toHaveBeenCalledWith(action);
            expect(next).toHaveBeenCalledWith(actions.loginFailure());
            expect(result).toEqual(actions.loginFailure());
        });
    });

    describe("Logout Action", () => {
        it("can logout and clear the key storage", async () => {
            const action = actions.logout();
            const result = await middleware(action);

            expect(next).toHaveBeenCalledWith(action);
            expect(result).toEqual(action);

            // The action should only be 'nexted' once.
            // This is a hedge against a previous version that incorrectly called `next(action)` while
            // also returning another call of `next(action)`.
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    // Note: Can't really test the `initFromStorage` actions without a ton of mocking, since
    // IndexedDB doesn't exactly work under JSDOM. And with all the mocking, does it really test anything?

    describe("Encrypt/Decrypt Meta Actions", () => {
        it("can encrypt/decrypt a message if the action has a meta tag", async () => {
            await middleware(actions.login(userCredentials));

            const payload = {
                id: "123",
                date: "2020",
                description: "a description"
            };

            const baseAction = {
                type: "anything",
                payload
            };

            // Encrypt the payload.
            const encrypted = await middleware({
                ...baseAction,
                meta: {
                    encrypt: EncryptionSchema.single("transaction")
                }
            });

            // The ID isn't in the schema, so it shouldn't be encrypted.
            expect(encrypted.payload.id).toBe(payload.id);
            expect(encrypted.payload.date).not.toBe(payload.date);
            expect(encrypted.payload.description).not.toBe(payload.description);

            expect(encrypted.meta.originalPayload).toEqual(payload);
            expect(encrypted.meta.encrypt).toBeUndefined();

            expect(next).toHaveBeenCalledWith(encrypted);

            // Decrypt the payload.
            const decrypted = await middleware({
                ...baseAction,
                meta: {
                    decrypt: EncryptionSchema.single("transaction")
                },
                payload: encrypted.payload
            });

            expect(decrypted.payload).toEqual(payload);

            expect(decrypted.meta.originalPayload).toEqual(encrypted.payload);
            expect(encrypted.meta.decrypt).toBeUndefined();

            expect(next).toHaveBeenCalledWith(decrypted);
        });
    });

    describe("Other Actions", () => {
        it("just passes through every other action", async () => {
            const action = {type: "something", payload: {id: "123"}};
            const result = await middleware(action);

            expect(result).toEqual(action);
        });
    });
});
