import {PayloadAction} from "@reduxjs/toolkit";
import {call, put} from "redux-saga/effects";
import {toastsSlice} from "store/";
import {RollbackPayload} from "store/utils";
import {ErrorToastData} from "structures/";

type RollbackSaga<OriginalPayload, RollbackData> = (
    action: PayloadAction<RollbackPayload<OriginalPayload, RollbackData>>
) => Generator<any, string | undefined>;

/* A wrapper for offline request rollback sagas.
 * Handles issuing the toast indicating the rollback has occurred.
 *
 * The reason that this isn't integrated as part of OfflineRequestSlice or OfflineRequestManager
 * is that it needs access to the Toasts slice and, as such, it can't be in the store's top-level
 * 'utils' folder. Otherwise, there is potential for circular dependencies to crop up.
 */
const rollbackWrapper = <OriginalPayload, RollbackData = OriginalPayload>(
    rollbackSaga: RollbackSaga<OriginalPayload, RollbackData>
) =>
    function* (action: PayloadAction<RollbackPayload<OriginalPayload, RollbackData>>) {
        // Get the error message as the return value of the saga.
        const errorMessage: string = yield call(rollbackSaga, action);

        // The saga can return nothing to not show an error message.
        // This can be useful when the rollback saga performs error handling
        // and determines that rolling back isn't necessary.
        if (errorMessage) {
            const errorToast = new ErrorToastData({message: errorMessage});
            yield put(toastsSlice.actions.add(errorToast));
        }
    };

export default rollbackWrapper;
