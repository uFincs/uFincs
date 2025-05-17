import {PayloadAction} from "@reduxjs/toolkit";
import {push} from "connected-react-router";
import {all, call, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import api, {apiErrors} from "api/";
import {Account, AccountData, ImportRule, TransactionData} from "models/";
import {
    accountsSlice,
    accountsRequestsSlice,
    importRulesRequestsSlice,
    modalsSlice,
    toastsSlice,
    transactionsSlice,
    transactionsRequestsSlice,
    crossSliceSelectors
} from "store/";
import {rollbackWrapper, showFailureToastSaga} from "store/sagas/utils";
import {MessageToastData, UndoToastData} from "structures/";
import chunkArray from "utils/chunkArray";
import {Id} from "utils/types";
import {DerivedAppScreenUrls} from "values/screenUrls";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";
import {removeAccountActionsFromRules} from "./importRules.sagas";

export function* fetchAllEffect() {
    // Note: The received objects are not _true_ AccountData (or TransactionData), because
    // their fields are encrypted.
    //
    // As a result, all number fields are actually strings.
    // That is why we don't want to instantiate the results into full Account/Transaction objects;
    // the encrypted strings will throw errors in the model constructors.
    //
    // However, we maintain the use of the AccountData/TransactionData types for simplicity,
    // particularly for the tests.
    const result: Array<AccountData> = yield call(api.service("accounts").find);

    const accountsById = result.reduce<Record<Id, AccountData>>((acc, accountData) => {
        const transactionIds = accountData.transactions!.map(({id}) => id);

        const account = {...accountData, transactionIds};
        account.transactions = []; // Zero out the transactions for storage in the store -> normalization
        acc[account.id] = account;

        return acc;
    }, {});

    const transactionsById = result.reduce<Record<Id, TransactionData>>(
        (allTransactions, accountData) => {
            return accountData.transactions!.reduce((accountTransactions, transactionData) => {
                accountTransactions[transactionData.id] = transactionData;
                return accountTransactions;
            }, allTransactions);
        },
        {}
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            accountsSlice.actions.set(accountsById),
            EncryptionSchema.mapOf("account")
        )
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            transactionsSlice.actions.set(transactionsById),
            EncryptionSchema.mapOf("transaction")
        )
    );

    // UFC-435: OK, this might seem like it shouldn't do anything, but it's actually kinda clutch.
    //
    // Basically, we want to ensure that the state update actions have actually been dispatched before
    // we finish out of this saga, since `appBoot` relies on the freshly fetched state being fully
    // populated for ordering purposes. In particular, for ensuring recurring transaction realization
    // happens only once everything has been fetched.
    //
    // However, there is a very interesting race condition that can occur where the `set` actions above
    // don't actually hit the store state before realization happens. This is because the actions will
    // be caught by the decryption middleware and held there while we wait for decryption to happen.
    //
    // Therefore, for a sufficiently large amount of data that is waiting to be decrypted, the `set`
    // actions can actually end up hitting the store state _after_ the recurring transaction realization
    // has already occurred, causing the realized transactions to disappear from the UI from the user's POV.
    //
    // On top of that, the problem can be compounded even worse since this race condition can cause recurring
    // transactions to be realized multiple times when the user refreshes the page to fetch again.
    //
    // Therefore, what we need to do is throw up a "take all" here to ensure we block the completion
    // of the `fetchAllEffect` saga until the decryption middleware has finished and passed the `set`
    // actions along for store state updates.
    //
    // Note that this only works because the decryption middleware is before the saga middleware in the
    // store config.
    yield all([take(accountsSlice.actions.set), take(transactionsSlice.actions.set)]);
}

export function* createCommit({payload}: PayloadAction<AccountData>) {
    const account = new Account(payload);
    account.validate();

    yield put(accountsSlice.actions.add(account));

    return account;
}

export function* createEffect({payload}: PayloadAction<AccountData>) {
    const account = payload;
    yield call(api.service("accounts").create, account);
}

export const createRollback = rollbackWrapper<AccountData>(function* ({payload}) {
    const {rollbackData: account, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    yield put(accountsSlice.actions.delete(account.id));

    return `Failed to save account ${account.name}. Rolled back creation.`;
});

function* createManyCommit({payload}: PayloadAction<Array<AccountData>>) {
    const accounts = payload.map((data) => {
        const account = new Account(data);
        account.validate();
        return account;
    });

    yield put(accountsSlice.actions.addMany(accounts));

    return accounts;
}

function* createManyEffect({payload}: PayloadAction<Array<AccountData>>) {
    yield call(api.service("accounts").create, payload);
}

const createManyRollback = rollbackWrapper<Array<AccountData>>(function* ({payload}) {
    const {rollbackData: accounts, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    for (const account of accounts) {
        yield put(accountsSlice.actions.delete(account.id));
    }

    return "Failed to save accounts. Rolled back creation.";
});

export function* updateCommit({payload}: PayloadAction<AccountData>) {
    const account = new Account(payload);
    const oldAccount = yield select((state) =>
        accountsSlice.selectors.selectAccount(state, account.id)
    );

    account.validate();

    yield put(accountsSlice.actions.update(account));

    return {payload: account, rollbackData: oldAccount};
}

export function* updateEffect({payload}: PayloadAction<AccountData>) {
    const account = payload;
    yield call(api.service("accounts").update, account.id, account);
}

export const updateRollback = rollbackWrapper<AccountData>(function* ({payload}) {
    const {rollbackData: oldAccount} = payload;

    yield put(accountsSlice.actions.update(oldAccount));

    return `Failed to save changes to account "${oldAccount.name}". Rolled back changes.`;
});

export function* destroyCommit({payload}: PayloadAction<Id>) {
    const accountId = payload;
    const account = yield select(crossSliceSelectors.accounts.selectAccount(accountId));

    if (!account) {
        throw new Error("Deleted account does not exist.");
    }

    // Destroy the transactions first.
    for (const transactionId of account.transactionIds) {
        yield put(transactionsSlice.actions.delete(transactionId));
    }

    // Remove the account from the store.
    yield put(accountsSlice.actions.delete(accountId));

    return {payload: account, rollbackData: account};
}

export function* destroyEffect({payload}: PayloadAction<AccountData>) {
    const account = payload;

    // OK, so apparently... when there are a _lot_ of transactions to delete, the request will fail
    // on the 'preflight check'... presumably because the URL is too long? IDK, but chunking up
    // the IDs into smaller sets of requests does the trick.
    const chunkedIds = chunkArray(account.transactionIds, 30);

    // Destroy the transactions first, invoking the effects directly
    // since we committed the deletions in destroyCommit.
    for (const idChunk of chunkedIds) {
        yield call(api.service("transactions").remove, null, {
            query: {
                id: {
                    $in: idChunk
                }
            }
        });
    }

    yield call(api.service("accounts").remove, account.id);
}

export const destroyRollback = rollbackWrapper<AccountData>(function* ({payload}) {
    // TECH DEBT: If the rollback has to happen after some transactions have already been deleted during
    // the effect (i.e. from the backend), then... that's really bad. Because the rollback process
    // doesn't (currently) handle re-creating the transactions on the backend. So... we should probably
    // change it do that.. one day.
    //
    // This came up when I realized that the effect could 'fail' as a result of the request taking
    // longer than the default timeout, causing the effect to run multiple times, destroying everything
    // but the actual account, then going to rollback and having the transactions re-created on
    // the frontend but not the backend. Yeah, pretty bad. Oh well, tech debt.
    //
    // SECOND TECH DEBT: Totally unrelated to the above, but if an account rollback occurs,
    // then any import rule actions that were deleted as a result of deleting this account
    // likely won't get rolled back. Why 'likely'? Because the only mechanism for rolling the actions
    // back is the import rule update rollback. So if, somehow, an account rollback occurs but
    // the rule rollbacks don't happen, then the deleted actions will be permanently deleted.
    // And by permanently, I mean... until the user refreshes.
    const {rollbackData: account} = payload;

    const existingAccount = yield select((state) =>
        accountsSlice.selectors.selectAccount(state, account.id)
    );

    if (existingAccount) {
        return;
    }

    // Make sure to wipe out the balance to 0 in case it was already calculated.
    account.balance = 0;

    yield put(accountsSlice.actions.add(account));
    yield put(transactionsSlice.actions.addMany(account.transactions!));

    return `Failed to save deleting account "${account.name}". Rolled back deletion.`;
});

export function* undoableDestroy({payload}: PayloadAction<Id>) {
    const accountId = payload;
    const account = yield select(crossSliceSelectors.accounts.selectAccount(accountId));
    const transactions = [];

    for (const transactionId of account.transactionIds) {
        transactions.push(
            yield select(transactionsSlice.selectors.selectTransaction(transactionId))
        );
    }

    // Show and wait for the confirmation modal.
    yield put(modalsSlice.actions.showAccountDeletionModal());

    const {cancel} = yield race({
        confirm: take(modalsSlice.actions.confirmAccountDeletionModal),
        cancel: take(modalsSlice.actions.cancelAccountDeletionModal)
    });

    if (cancel) {
        return;
    }

    // Navigate the user to the Accounts list if they're on the ViewAccount page,
    // so that they don't see invalid information as the account is deleted.
    if (yield call(userOnViewAccountPage)) {
        yield put(push(DerivedAppScreenUrls.ACCOUNTS));
    }

    // Delete the account and its transactions.
    yield put(accountsRequestsSlice.destroy.actions.request(accountId));

    const {failure} = yield race({
        success: take(accountsRequestsSlice.destroy.actions.success),
        failure: take(accountsRequestsSlice.destroy.actions.failure)
    });

    if (failure) {
        // Failure is handled by the showFailureToastSaga registered for destroy's
        // commit failure state.
        return;
    }

    // Delete all of the import rule actions that are associated with this account.
    const oldImportRules: Array<ImportRule> = yield call(removeAccountActionsFromRules, accountId);

    // Show the Undo toast.
    const undoToast = new UndoToastData({message: `Deleted account "${account.name}"`});
    yield put(toastsSlice.actions.add(undoToast));

    // Wait for the Undo toast to resolve.
    const {undo} = yield race({
        close: take(undoToast.onClose),
        undo: take(undoToast.onUndo)
    });

    if (undo) {
        // Recreate the account and transactions.

        // Gotta zero out a bunch of stuff from the account, since it's a fully populated instance.
        // We _especially_ need to zero out the `transactions`, otherwise they'll get duplicated.
        // And if they get duplicated, then each subsequent undo of an account's deletion will
        // cause the payload size to explode, eventually throwing storage errors.
        account.balance = 0;
        account.transactions = [];
        account.transactionIds = [];

        yield put(accountsRequestsSlice.create.actions.request(account));
        yield take(accountsRequestsSlice.create.actions.success);

        yield put(transactionsRequestsSlice.createMany.actions.request(transactions));
        yield take(transactionsRequestsSlice.createMany.actions.success);

        // Recreate the actions of the import rules that were removed.
        for (const rule of oldImportRules) {
            yield put(importRulesRequestsSlice.update.actions.request(rule));
        }

        // Show the success toast.
        const messageToast = new MessageToastData({message: "Undo successful"});
        yield put(toastsSlice.actions.add(messageToast));
    }
}

function* accountsSaga() {
    yield fork(accountsRequestsSlice.fetchAll.watchCommitSaga(undefined, {isFetchEffect: true}));
    yield fork(accountsRequestsSlice.fetchAll.watchEffectSaga(fetchAllEffect));

    yield fork(accountsRequestsSlice.create.watchCommitSaga(createCommit));
    yield fork(accountsRequestsSlice.create.watchEffectSaga(createEffect));
    yield fork(accountsRequestsSlice.create.watchRollbackSaga(createRollback));

    yield fork(accountsRequestsSlice.createMany.watchCommitSaga(createManyCommit));
    yield fork(accountsRequestsSlice.createMany.watchEffectSaga(createManyEffect));
    yield fork(accountsRequestsSlice.createMany.watchRollbackSaga(createManyRollback));

    yield fork(accountsRequestsSlice.update.watchCommitSaga(updateCommit));
    yield fork(accountsRequestsSlice.update.watchEffectSaga(updateEffect));
    yield fork(accountsRequestsSlice.update.watchRollbackSaga(updateRollback));

    yield fork(accountsRequestsSlice.destroy.watchCommitSaga(destroyCommit));
    yield fork(accountsRequestsSlice.destroy.watchEffectSaga(destroyEffect));
    yield fork(accountsRequestsSlice.destroy.watchRollbackSaga(destroyRollback));

    yield all([
        takeEvery(accountsSlice.actions.undoableDestroyAccount, undoableDestroy),
        takeEvery(
            accountsRequestsSlice.fetchAll.actions.failure,
            showFailureToastSaga(accountsRequestsSlice.fetchAll.actions.clear)
        ),
        takeEvery(
            accountsRequestsSlice.create.actions.failure,
            showFailureToastSaga(accountsRequestsSlice.create.actions.clear)
        ),
        takeEvery(
            accountsRequestsSlice.update.actions.failure,
            showFailureToastSaga(accountsRequestsSlice.update.actions.clear)
        ),
        takeEvery(
            accountsRequestsSlice.destroy.actions.failure,
            showFailureToastSaga(accountsRequestsSlice.destroy.actions.clear)
        )
    ]);
}

/* Helper Functions */

export function* userOnViewAccountPage() {
    const viewAccountRegex = new RegExp(`${DerivedAppScreenUrls.ACCOUNTS}/.+`);
    const currentRoute = yield select(crossSliceSelectors.router.selectCurrentRoute);

    return viewAccountRegex.test(currentRoute);
}

export default accountsSaga;
