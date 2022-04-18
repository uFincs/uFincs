// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

import crypto from "isomorphic-webcrypto";

// Need to polyfill WebCrypto in Jest since JSDOM doesn't yet support it.
// @ts-ignore
global.crypto = crypto;

// Mock localForage since we don't have access to IndexedDB/local storage in JSDOM
// (jest's testing environment). Otherwise, we get lots of errors.
jest.mock("localforage", () => {
    return {
        config: jest.fn(),
        createInstance: jest.fn(),
        setItem: jest.fn(),
        getItem: jest.fn(),
        clear: jest.fn()
    };
});
