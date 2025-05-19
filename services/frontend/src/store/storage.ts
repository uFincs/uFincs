import storage from "redux-persist/lib/storage";
import localForage from "./localForage";

/* redux-persist storage config */

// Because we mock localForage in Jest (because of, you know, the lack of IndexedDB), the localForage
// instance will be null in Jest. As such, we must fallback to regular localStorage.
export default localForage || storage;
