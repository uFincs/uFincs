import {createAction} from "@reduxjs/toolkit";

// Note: The encryption slice is not, in fact, a slice. Well, not a _complete_ slice. It is merely
// a collection of actions that are used for handling the encryption process. There is no reducer
// or selectors (hence, no state), since all of the encryption state is handled internally by
// the `redux-e2e-encryption` middleware.

export const encryptionSlice = {
    actions: {
        initAtAppBoot: createAction("encryption/initAtAppBoot"),
        initAtAppBootSuccess: createAction("encryption/initAtAppBoot/success"),
        initAtAppBootFailure: createAction<{message: string} | undefined>(
            "encryption/initAtAppBoot/failure"
        )
    }
};
