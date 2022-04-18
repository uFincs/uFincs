import {configureStore, StoreEnhancer} from "@reduxjs/toolkit";
import {routerMiddleware} from "connected-react-router";
import {createBrowserHistory} from "history";
import {persistStore, persistReducer} from "redux-persist";
import createSagaMiddleware from "redux-saga";
import thunkMiddleware from "redux-thunk";

import {createEncryptionMiddleware} from "vendor/redux-e2e-encryption";
import {disableRequestsWhenNoAccount} from "./middleware";
import mounts from "./mountpoints";
import createRootReducer from "./rootReducer";
import registerSagas from "./sagas";
import {unhandledErrorsSlice} from "./slices";
import storage from "./storage";
import {objectifyError} from "./utils/objectifyError";

const persistConfig = {
    key: "ufincs",
    storage,
    whitelist: [
        mounts.accounts,
        mounts.featureFlags,
        mounts.importProfiles,
        mounts.importProfileMappings,
        mounts.importRules,
        mounts.importRuleActions,
        mounts.importRuleConditions,
        mounts.offlineRequestManager,
        mounts.preferences,
        mounts.routerExtension,
        mounts.recurringTransactions,
        mounts.transactions,
        mounts.transactionsDateIndex,
        mounts.transactionsIndex,
        mounts.user
        // Note: We are _not_ persisting the virtual transactions,
        // since those can get very large very fast with no obvious
        // way for the user to clear the cache if we always persist them.
    ]
};

const encryptionSchema = {
    account: {
        name: "string",
        type: "string",
        openingBalance: "integer",
        interest: "integer",
        createdAt: "string",
        updatedAt: "string"
    },
    transaction: {
        amount: "integer",
        date: "string",
        description: "string",
        notes: "string",
        type: "string",
        createdAt: "string",
        updatedAt: "string"
    },
    recurringTransaction: {
        amount: "integer",
        description: "string",
        notes: "string",
        type: "string",
        interval: "integer",
        freq: "string",
        on: "integer",
        startDate: "string",
        endDate: "string",
        count: "integer",
        neverEnds: "boolean",
        lastRealizedDate: "string",
        createdAt: "string",
        updatedAt: "string"
    },
    importProfile: {
        name: "string",
        importProfileMappings: ["importProfileMapping"],
        createdAt: "string",
        updatedAt: "string"
    },
    importProfileMapping: {
        from: "string",
        to: "string",
        createdAt: "string",
        updatedAt: "string"
    },
    importRule: {
        createdAt: "string",
        updatedAt: "string",
        importRuleActions: ["importRuleAction"],
        importRuleConditions: ["importRuleCondition"]
    },
    importRuleAction: {
        property: "string",
        value: "string",
        createdAt: "string",
        updatedAt: "string"
    },
    importRuleCondition: {
        condition: "string",
        property: "string",
        value: "string",
        createdAt: "string",
        updatedAt: "string"
    },
    preference: {
        currency: "string"
    }
} as const;

export const history = createBrowserHistory({forceRefresh: false});

export default (...enhancers: Array<StoreEnhancer>) => {
    const reducer = createRootReducer(history);

    const encryptionMiddleware = createEncryptionMiddleware(encryptionSchema);

    const sagaMiddleware = createSagaMiddleware({
        onError: (error) => {
            store.dispatch(unhandledErrorsSlice.actions.push(objectifyError(error)));
        }
    });

    const middleware = [
        disableRequestsWhenNoAccount,
        encryptionMiddleware,
        thunkMiddleware,
        sagaMiddleware,
        routerMiddleware(history)
    ];

    const preloadedState = {};

    const store = configureStore({
        reducer: persistReducer(persistConfig, reducer),
        enhancers,
        middleware,
        preloadedState,
        devTools: true
    });

    const persistor = persistStore(store);

    registerSagas(sagaMiddleware);

    return {store, persistor};
};
