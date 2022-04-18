import mounts from "store/mountpoints";
import {createRequestSlices} from "store/utils";

export const billingRequestsSlice = createRequestSlices(mounts.billingRequests, [
    "checkout",
    "gotoCustomerPortal"
]);
