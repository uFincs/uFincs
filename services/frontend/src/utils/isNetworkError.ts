import {BACKEND_DATABASE_SERVICE} from "config";

const isNetworkError = (errorMessage: string) => {
    if (
        errorMessage === "Network Error" ||
        errorMessage === "Failed to fetch" ||
        errorMessage.includes(BACKEND_DATABASE_SERVICE)
    ) {
        return true;
    } else {
        return false;
    }
};

export default isNetworkError;
