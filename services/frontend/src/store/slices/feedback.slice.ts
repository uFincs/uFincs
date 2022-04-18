import mounts from "store/mountpoints";
import {createRequestSlices} from "store/utils";

export const feedbackRequestsSlice = createRequestSlices(mounts.feedbackRequests, ["create"]);
