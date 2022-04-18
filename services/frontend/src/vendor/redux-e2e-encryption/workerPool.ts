import {Base64String, E2ECrypto, RawString} from "./crypto";
import {parsePayloadFormat, FieldsSchema, PAYLOAD_SHAPE} from "./schema";
import {Workerized} from "./types";
import createWorker from "workerize-loader!./worker"; // eslint-disable-line
import * as CryptoWorker from "./worker";

/** Manages a pool of workers to enable parallel processing of encryption/decryption
 *  operations. While this does speed up processing of large payloads by 2-3 times,
 *  it also introduces a (practically negligible) overhead for very small payloads. */
export class WorkerPool {
    currentWorkerIndex: number;
    pool: Array<Workerized<typeof CryptoWorker>>;
    size: number;

    constructor() {
        this.currentWorkerIndex = 0;
        this.pool = [];

        // If hardwareConcurrency isn't defined, then (undefined - 2) results in NaN.
        // APPARENTLY, `Math.max` takes the NaN over the number.
        // WHYYYYYYYY!?!?!?!
        this.size = Math.max(navigator?.hardwareConcurrency - 2 || 0, 2);

        this.fillPool();
    }

    /** Fills the pool with workers based. */
    private fillPool() {
        for (let i = 0; i < this.size; i++) {
            const worker = createWorker<typeof CryptoWorker>();
            this.pool.push(worker);
        }
    }

    /** Passes in a schema to all of the workers to initialize them. */
    public async initSchema(schema: FieldsSchema) {
        const promises = [];

        for (let i = 0; i < this.size; i++) {
            const worker = this.pool[i];
            promises.push(worker.initSchema(schema));
        }

        await Promise.all(promises);
    }

    /** Passes in information to all of the workers for them to initialize the keys.. */
    public async initKeys(
        encodedEDEK: Base64String,
        encodedKEKSalt: Base64String,
        password: RawString,
        userId: RawString
    ) {
        if (await E2ECrypto.isStorageAvailable()) {
            // This is a speed optimization for when IndexedDB is available (i.e. basically
            // anything modern that isn't Firefox in Private Browsing).
            //
            // By initializing the crypto keys in the main thread, they can then be picked
            // up by the workers from the IndexedDB key storage. This is much, _much_ faster
            // than having all the workers initialize the keys independently.
            //
            // This is because, as I've recently found out, WebCrypto operations aren't
            // actually sped up by using Web Workers; WebCrypto operations actually have their
            // own dedicated pool of threads (4 in Firefox, only 1 in Chrome), so parallelizing
            // things with Web Workers only really speeds up our own user code.
            await new E2ECrypto().init(encodedEDEK, encodedKEKSalt, password, userId);
            await this.initKeysFromStorage(userId);
        } else {
            // However, when we _don't_ have access to IndexedDB, then we _do_ need to initialize
            // the keys in each worker independently.
            //
            // Note that parallelizing these operations using `Promise.all` _does_ speed up the
            // common case where this happens (Firefox in Private Browsing), since Firefox
            // does have 4 threads to work with for its WebCrypto operations.
            const promises = [];

            for (let i = 0; i < this.size; i++) {
                const worker = this.pool[i];
                promises.push(worker.initKeys(encodedEDEK, encodedKEKSalt, password, userId));
            }

            await Promise.all(promises);
        }
    }

    /** Instructs all of the workers to initialize their keys from storage. */
    public async initKeysFromStorage(userId: RawString) {
        const promises = [];

        for (let i = 0; i < this.size; i++) {
            const worker = this.pool[i];
            promises.push(worker.initKeysFromStorage(userId));
        }

        await Promise.all(promises);
    }

    /** Encrypts a payload with the specified format. */
    public async encrypt(payload: any, payloadFormat: string) {
        return this.processJob(payload, payloadFormat, this.encryptSingle.bind(this));
    }

    /** Decrypts a payload with the specified format. */
    public async decrypt(payload: any, payloadFormat: string) {
        return this.processJob(payload, payloadFormat, this.decryptSingle.bind(this));
    }

    /** Performs encryption on a single chunk of the payload by giving the chunk to a single worker. */
    private async encryptSingle(payload: any, payloadFormat: string) {
        const worker = this.pool[this.currentWorkerIndex];
        this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.size;

        return worker.encrypt(payload, payloadFormat);
    }

    /** Performs decryption on a single chunk of the payload by giving the chunk to a single worker. */
    private async decryptSingle(payload: any, payloadFormat: string) {
        const worker = this.pool[this.currentWorkerIndex];
        this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.size;

        return worker.decrypt(payload, payloadFormat);
    }

    /** Handles job processing -- that is chunking up the payload based on
     *  payload format and number of workers. */
    private async processJob(
        payload: any,
        payloadFormat: string,
        cryptoFunction: (payload: any, payloadFormat: string) => Promise<any>
    ) {
        const {shape} = parsePayloadFormat(payloadFormat);

        let chunkedPayload = [];
        const promises = [];

        // Depending on the shape, we'll have different strategies for parallelizing the work.
        switch (shape) {
            case PAYLOAD_SHAPE.SINGLE:
                // Just process the single payload object.
                return cryptoFunction(payload, payloadFormat);
            case PAYLOAD_SHAPE.ARRAY:
                // Chunk the array into an array of arrays, and spread the chunks
                // among the workers.
                chunkedPayload = chunkArray(
                    payload,
                    Math.max(Math.round(payload.length / this.size), 1)
                );

                for (const chunk of chunkedPayload) {
                    promises.push(cryptoFunction(chunk, payloadFormat));
                }

                return (await Promise.all(promises)).flat();
            case PAYLOAD_SHAPE.MAP:
                // Chunk the object into an array of sub-objects, and spread the chunks
                // among the workers.
                chunkedPayload = chunkObject(
                    payload,
                    Math.max(Math.round(Object.keys(payload).length / this.size), 1)
                );

                for (const chunk of chunkedPayload) {
                    promises.push(cryptoFunction(chunk, payloadFormat));
                }

                const result = (await Promise.all(promises)) as Array<Record<string, any>>;
                return flattenChunkedObject(result);
            default:
                return;
        }
    }
}

/* Helper Functions */

/** Chunks an array into an array of multiple arrays for parallel processing. */
const chunkArray = <T>(array: Array<T>, chunkSize = 10): Array<Array<T>> => {
    const chunkedArray = [];

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        chunkedArray.push(chunk);
    }

    return chunkedArray;
};

/** Chunks an object into an array of multiple objects for parallel processing. */
const chunkObject = <T>(obj: Record<string, T>, chunkSize = 10): Array<Record<string, T>> => {
    const keys = Object.keys(obj);
    const chunkedKeys = chunkArray(keys, chunkSize);

    const chunkedObject = [];

    for (const keyChunk of chunkedKeys) {
        const objectChunk = {} as Record<string, T>;

        for (const key of keyChunk) {
            objectChunk[key] = obj[key];
        }

        chunkedObject.push(objectChunk);
    }

    return chunkedObject;
};

/** Flattens a chunked object (array of objects) back into a single object. */
const flattenChunkedObject = <T>(chunkedObject: Array<Record<string, T>>) => {
    const flatObject = {} as Record<string, T>;

    for (const chunk of chunkedObject) {
        Object.keys(chunk).forEach((key) => {
            flatObject[key] = chunk[key];
        });
    }

    return flatObject;
};
