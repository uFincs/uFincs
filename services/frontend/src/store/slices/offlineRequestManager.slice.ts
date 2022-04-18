import mounts from "store/mountpoints";
import {createOfflineRequestManager} from "store/utils";

export const offlineRequestManagerSlice = createOfflineRequestManager(mounts.offlineRequestManager);
