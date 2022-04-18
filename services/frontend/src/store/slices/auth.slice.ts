import mounts from "store/mountpoints";
import {createRequestSlices} from "store/utils";

export const authRequestsSlice = createRequestSlices(mounts.authRequests, [
    "changeEmail",
    "changePassword",
    "deleteUserAccount",
    "login",
    "loginWithoutAccount",
    "logout",
    "passwordReset",
    "refreshToken",
    "sendPasswordReset",
    "signUp",
    "signUpFromNoAccount"
]);
