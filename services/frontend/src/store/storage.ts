import storage from "redux-persist/lib/storage";
import {NativePlatformsService} from "services/";
import localForage from "./localForage";

/* Mobile Storage Adaptor */

/** This is a redux-persist compatible adapter over the native mobile storage interface.
 *
 *  By using a native storage plugin rather than IndexedDB, we get a better guarantee on
 *  how persistent our data is. */
class MobileNativeStorage {
    static async getItem(key: string) {
        return (await NativePlatformsService.storage.get({key})).value;
    }

    static async setItem(key: string, value: any) {
        NativePlatformsService.storage.set({key, value});
    }

    static async removeItem(key: string) {
        NativePlatformsService.storage.remove({key});
    }

    static async getAllKeys() {
        return NativePlatformsService.storage.keys();
    }

    static async clear() {
        NativePlatformsService.storage.clear();
    }
}

/* redux-persist storage config */

// Only if we're running on a native platform (i.e. Android or iOS) should we use the native storage.
// Otherwise, we're on web and should use localForage.
//
// Because we mock localForage in Jest (because of, you know, the lack of IndexedDB), the localForage
// instance will be null in Jest. As such, we must fallback to regular localStorage.
export default (NativePlatformsService.isMobilePlatform() ? MobileNativeStorage : localForage) ||
    storage;
