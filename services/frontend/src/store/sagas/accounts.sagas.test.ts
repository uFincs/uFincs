import {push} from "connected-react-router";
import {call} from "redux-saga/effects";
import {expectSaga} from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {Matcher} from "redux-saga-test-plan/matchers";
import {EffectProviders} from "redux-saga-test-plan/providers";
import api from "api/";
import {Account, Transaction} from "models/";
import {
    accountsSlice,
    accountsRequestsSlice,
    modalsSlice,
    transactionsSlice,
    transactionsRequestsSlice,
    toastsSlice
} from "store/";
import {RollbackPayload} from "store/utils";
import {
    actionWithDummyType,
    expectSagaError,
    provideSelect,
    silenceConsoleErrors,
    SAGA_TIMEOUT
} from "utils/testHelpers";
import {DerivedAppScreenUrls} from "values/screenUrls";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";
import accountsSaga, * as sagas from "./accounts.sagas";
import {removeAccountActionsFromRules} from "./importRules.sagas";

const transaction1 = new Transaction({
    description: "A valid transaction description",
    amount: 100,
    type: Transaction.TRANSACTION_TYPES[0],
    creditAccountId: "a",
    debitAccountId: "b"
});

const validAccount = new Account({
    id: "a",
    name: "A name",
    type: Account.ACCOUNT_TYPES[0],
    transactionIds: [transaction1.id],
    transactions: [transaction1]
});

const invalidAccount = new Account();

describe("fetchAll sagas", () => {
    const transaction1 = new Transaction();
    const transaction2 = new Transaction();

    const creditAccount = new Account({transactions: [transaction1]});
    const debitAccount = new Account({transactions: [transaction2]});

    const accounts = [creditAccount, debitAccount];

    const expectedAccountsById = {
        [creditAccount.id]: {
            ...creditAccount,
            transactionIds: [transaction1.id],
            transactions: []
        },
        [debitAccount.id]: {
            ...debitAccount,
            transactionIds: [transaction2.id],
            transactions: []
        }
    };

    const expectedTransactionsById = {
        [transaction1.id]: transaction1,
        [transaction2.id]: transaction2
    };

    it("fetches all of the accounts and transactions", () => {
        return expectSaga(sagas.fetchAllEffect)
            .provide([[call(api.service("accounts").find), accounts]])
            .call(api.service("accounts").find)
            .put({
                ...accountsSlice.actions.set(expectedAccountsById),
                meta: {decrypt: EncryptionSchema.mapOf("account")}
            })
            .put({
                ...transactionsSlice.actions.set(expectedTransactionsById),
                meta: {decrypt: EncryptionSchema.mapOf("transaction")}
            })
            .run();
    });
});

describe("create sagas", () => {
    describe("createCommit", () => {
        it("can create an account", () => {
            return expectSaga(sagas.createCommit, actionWithDummyType(validAccount))
                .put(accountsSlice.actions.add(validAccount))
                .run();
        });

        it("throws an error if the account is invalid", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.createCommit, actionWithDummyType(invalidAccount)).run()
            );
        });
    });

    describe("createEffect", () => {
        it("can request to create a new account", () => {
            return expectSaga(sagas.createEffect, actionWithDummyType(validAccount))
                .provide([[matchers.call.fn(api.service("accounts").create), null]])
                .call.fn(api.service("accounts").create)
                .run();
        });
    });

    describe("createRollback", () => {
        it("can rollback creation by deleting the account and issuing a toast", () => {
            const payload = {rollbackData: validAccount};

            return expectSaga(sagas.createRollback, actionWithDummyType(payload))
                .put(accountsSlice.actions.delete(validAccount.id))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("can abort rolling back if the API error was for trying to create a duplicate account", () => {
            const error = {code: 400, errors: [{message: "id must be unique"}]};
            const payload = {rollbackData: validAccount, error};

            return expectSaga(sagas.createRollback, actionWithDummyType(payload))
                .not.put.actionType(accountsSlice.actions.delete.type)
                .not.put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("update sagas", () => {
    describe("updateCommit", () => {
        it("can update an account", () => {
            return expectSaga(sagas.updateCommit, actionWithDummyType(validAccount))
                .provide([provideSelect()])
                .put(accountsSlice.actions.update(validAccount))
                .run();
        });

        it("throws an error if the account is invalid", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.updateCommit, actionWithDummyType(invalidAccount)).run()
            );
        });
    });

    describe("updateEffect", () => {
        it("can request to update a transaction", () => {
            return expectSaga(sagas.updateEffect, actionWithDummyType(validAccount))
                .provide([[matchers.call.fn(api.service("accounts").update), null]])
                .call.fn(api.service("accounts").update)
                .run();
        });
    });

    describe("updateRollback", () => {
        it("can rollback updates by reverting to the old account data and issuing a toast", () => {
            const payload = {rollbackData: validAccount};

            return expectSaga(sagas.updateRollback, actionWithDummyType(payload))
                .put(accountsSlice.actions.update(validAccount))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("destroy sagas", () => {
    describe("destroyCommit", () => {
        it("can destroy an account", () => {
            return expectSaga(sagas.destroyCommit, actionWithDummyType(validAccount.id))
                .provide([provideSelect(validAccount)])
                .put(transactionsSlice.actions.delete(transaction1.id))
                .put(accountsSlice.actions.delete(validAccount.id))
                .run();
        });

        it("throws an error when the account to destroy doesn't exist", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.destroyCommit, actionWithDummyType(validAccount.id))
                    .provide([provideSelect()])
                    .run()
            );
        });
    });

    describe("destroyEffect", () => {
        it("can request to destroy an account", () => {
            return expectSaga(sagas.destroyEffect, actionWithDummyType(validAccount))
                .provide([
                    [matchers.call.fn(api.service("transactions").remove), null],
                    [matchers.call.fn(api.service("accounts").remove), null]
                ])
                .call.fn(api.service("transactions").remove)
                .call.fn(api.service("accounts").remove)
                .run();
        });
    });

    describe("destroyRollback", () => {
        it("can rollback deletions by re-creating the transaction", () => {
            const payload = {rollbackData: validAccount};

            return expectSaga(sagas.destroyRollback, actionWithDummyType(payload))
                .provide([provideSelect()])
                .put(accountsSlice.actions.add(validAccount))
                .put(transactionsSlice.actions.addMany(validAccount.transactions))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("can abort rolling back if the transaction already exists in the store", () => {
            const payload = {rollbackData: validAccount};

            return expectSaga(sagas.destroyRollback, actionWithDummyType(payload))
                .provide([provideSelect(validAccount)])
                .not.put(accountsSlice.actions.add(validAccount))
                .not.put(transactionsSlice.actions.addMany(validAccount.transactions))
                .not.put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("undoableDestroy", () => {
    // Since the selects are done using ID selectors (i.e. the actual selector is generated at runtime),
    // we can't match based on the exact function. As such, we do it the totally-lazy-and-fragile way
    // by just going by the number of selects that have been executed.
    const provideUndoableDestroySelects = (): EffectProviders => {
        let counter = 0;

        return {
            select: (_effect, next) => {
                // Return the account for the first select.
                if (counter === 0) {
                    counter += 1;
                    return validAccount;
                }

                // Return the one (and only) transaction for the second select.
                if (counter === 1) {
                    counter += 1;
                    return transaction1;
                }

                return next();
            }
        };
    };

    // Yes, technically userOnViewAccountPage shouldn't be on the 'sagas' import, but whatever.
    const provideCallAccountPageCheck = (value: boolean): Matcher => [
        call(sagas.userOnViewAccountPage),
        value
    ];

    const provideCallRemoveRules = (): Matcher => [
        call(removeAccountActionsFromRules, validAccount.id),
        []
    ];

    const actionParam = actionWithDummyType(validAccount.id);

    it("shows the confirmation modal before deleting anything", () => {
        return expectSaga(sagas.undoableDestroy, actionParam)
            .provide([provideUndoableDestroySelects(), provideCallRemoveRules()])
            .put(modalsSlice.actions.showAccountDeletionModal())
            .not.put.actionType(accountsRequestsSlice.destroy.actions.request().type)
            .silentRun(SAGA_TIMEOUT);
    });

    it("bails out of deletion if the user cancels the modal", () => {
        return expectSaga(sagas.undoableDestroy, actionParam)
            .provide([provideUndoableDestroySelects(), provideCallRemoveRules()])
            .dispatch(modalsSlice.actions.cancelAccountDeletionModal())
            .put(modalsSlice.actions.showAccountDeletionModal())
            .returns(undefined)
            .run();
    });

    it("navigates the user to the accounts list page if they on an account's details page", () => {
        return expectSaga(sagas.undoableDestroy, actionParam)
            .provide([
                provideUndoableDestroySelects(),
                provideCallAccountPageCheck(true),
                provideCallRemoveRules()
            ])
            .dispatch(modalsSlice.actions.confirmAccountDeletionModal())
            .put(push(DerivedAppScreenUrls.ACCOUNTS))
            .silentRun(SAGA_TIMEOUT);
    });

    it("deletes the account if the user confirms the modal", () => {
        return expectSaga(sagas.undoableDestroy, actionParam)
            .provide([
                provideUndoableDestroySelects(),
                provideCallAccountPageCheck(false),
                provideCallRemoveRules()
            ])
            .dispatch(modalsSlice.actions.confirmAccountDeletionModal())
            .put(accountsRequestsSlice.destroy.actions.request(validAccount.id))
            .silentRun(SAGA_TIMEOUT);
    });

    it("doesn't show the undo toast if the account deletion fails", () => {
        return expectSaga(sagas.undoableDestroy, actionParam)
            .provide([
                provideUndoableDestroySelects(),
                provideCallAccountPageCheck(false),
                provideCallRemoveRules()
            ])
            .dispatch(modalsSlice.actions.confirmAccountDeletionModal())
            .dispatch(accountsRequestsSlice.destroy.actions.failure({message: ""}))
            .put(accountsRequestsSlice.destroy.actions.request(validAccount.id))
            .not.put.actionType(toastsSlice.actions.add.type)
            .returns(undefined)
            .run();
    });

    it("shows the undo toast after successfully deleting the account", () => {
        return expectSaga(sagas.undoableDestroy, actionParam)
            .provide([
                provideUndoableDestroySelects(),
                provideCallAccountPageCheck(false),
                provideCallRemoveRules()
            ])
            .dispatch(modalsSlice.actions.confirmAccountDeletionModal())
            .dispatch(accountsRequestsSlice.destroy.actions.success())
            .put(accountsRequestsSlice.destroy.actions.request(validAccount.id))
            .put.actionType(toastsSlice.actions.add.type)
            .silentRun(SAGA_TIMEOUT);
    });

    it("re-creates the account and its transactions if the user chooses to undo", () => {
        const provideToastUndo = (): EffectProviders => ({
            race: (effect, next) => {
                if ("undo" in effect && effect.undo) {
                    return {undo: true};
                }

                return next();
            }
        });

        return (
            expectSaga(sagas.undoableDestroy, actionParam)
                .provide([
                    provideUndoableDestroySelects(),
                    provideCallAccountPageCheck(false),
                    provideCallRemoveRules(),
                    provideToastUndo()
                ])
                .dispatch(modalsSlice.actions.confirmAccountDeletionModal())
                .dispatch(accountsRequestsSlice.destroy.actions.success())
                .dispatch(accountsRequestsSlice.create.actions.success())
                .dispatch(transactionsRequestsSlice.createMany.actions.success())
                // Undo toast.
                .put.actionType(toastsSlice.actions.add.type)
                // Re-create account and transactions.
                .put(accountsRequestsSlice.create.actions.request(validAccount))
                .put(transactionsRequestsSlice.createMany.actions.request([transaction1]))
                // Success toast.
                .put.actionType(toastsSlice.actions.add.type)
                .returns(undefined)
                .run()
        );
    });

    it("doesn't re-create anything if the user doesn't choose to undo", () => {
        const provideToastClose = (): EffectProviders => ({
            race: (effect, next) => {
                if ("close" in effect && effect.close) {
                    return {close: true};
                }

                return next();
            }
        });

        return (
            expectSaga(sagas.undoableDestroy, actionParam)
                .provide([
                    provideUndoableDestroySelects(),
                    provideCallAccountPageCheck(false),
                    provideCallRemoveRules(),
                    provideToastClose()
                ])
                .dispatch(modalsSlice.actions.confirmAccountDeletionModal())
                .dispatch(accountsRequestsSlice.destroy.actions.success())
                // Undo toast.
                .put.actionType(toastsSlice.actions.add.type)
                // Don't re-create account and transactions.
                .not.put(accountsRequestsSlice.create.actions.request(validAccount))
                .not.put(transactionsRequestsSlice.create.actions.request(transaction1))
                // Don't show a success toast.
                .not.put.actionType(toastsSlice.actions.add.type)
                .returns(undefined)
                .run()
        );
    });
});

describe("saga registration", () => {
    describe("create", () => {
        it("has the commit saga registered", () => {
            return expectSaga(accountsSaga)
                .dispatch(accountsRequestsSlice.create.actions.request(validAccount))
                .put(accountsRequestsSlice.create.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(accountsSaga)
                .provide([[matchers.call.fn(api.service("accounts").create), null]])
                .dispatch(accountsRequestsSlice.create.actions.effectStart())
                .put(accountsRequestsSlice.create.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(accountsSaga)
                .dispatch(
                    accountsRequestsSlice.create.actions.rollbackStart(
                        new RollbackPayload({rollbackData: validAccount})
                    )
                )
                .put(accountsRequestsSlice.create.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("update", () => {
        it("has the commit saga registered", () => {
            return expectSaga(accountsSaga)
                .provide([provideSelect()])
                .dispatch(accountsRequestsSlice.update.actions.request(validAccount))
                .put(accountsRequestsSlice.update.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(accountsSaga)
                .provide([[matchers.call.fn(api.service("accounts").update), null]])
                .dispatch(accountsRequestsSlice.update.actions.effectStart(validAccount))
                .put(accountsRequestsSlice.update.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(accountsSaga)
                .dispatch(
                    accountsRequestsSlice.update.actions.rollbackStart(
                        new RollbackPayload({rollbackData: validAccount})
                    )
                )
                .put(accountsRequestsSlice.update.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("destroy", () => {
        it("has the commit saga registered", () => {
            return expectSaga(accountsSaga)
                .provide([provideSelect(validAccount)])
                .dispatch(accountsRequestsSlice.destroy.actions.request(validAccount.id))
                .put(accountsRequestsSlice.destroy.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the commit failure saga registered", () => {
            return expectSaga(accountsSaga)
                .dispatch(accountsRequestsSlice.destroy.actions.failure({message: ""}))
                .put.actionType(toastsSlice.actions.add.type)
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(accountsSaga)
                .provide([
                    [matchers.call.fn(api.service("transactions").remove), null],
                    [matchers.call.fn(api.service("accounts").remove), null]
                ])
                .dispatch(accountsRequestsSlice.destroy.actions.effectStart(validAccount))
                .put(accountsRequestsSlice.destroy.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(accountsSaga)
                .provide([provideSelect(validAccount)])
                .dispatch(
                    accountsRequestsSlice.destroy.actions.rollbackStart(
                        new RollbackPayload({
                            rollbackData: validAccount
                        })
                    )
                )
                .put(accountsRequestsSlice.destroy.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("undoableDestroy", () => {
        it("is registered", () => {
            return expectSaga(accountsSaga)
                .provide([provideSelect(validAccount)])
                .dispatch(accountsSlice.actions.undoableDestroyAccount(validAccount.id))
                .put(modalsSlice.actions.showAccountDeletionModal())
                .silentRun(SAGA_TIMEOUT);
        });
    });
});
