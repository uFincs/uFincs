import {webcrypto} from "node:crypto";
import {vi} from "vitest";

// Need to polyfill WebCrypto in tests since JSDOM doesn't yet support it.
Object.defineProperty(globalThis, "crypto", {
    value: webcrypto
});

// Mock localForage since we don't have access to IndexedDB/local storage in JSDOM.
// Otherwise, we get lots of errors.
vi.mock("localforage", () => {
    const module = {
        config: vi.fn(),
        createInstance: vi.fn(),
        setItem: vi.fn(),
        getItem: vi.fn(),
        clear: vi.fn(),
        INDEXEDDB: "indexeddb",
        LOCALSTORAGE: "localstorage"
    };

    return {
        default: module,
        ...module
    };
});
