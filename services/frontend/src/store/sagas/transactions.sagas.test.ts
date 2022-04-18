import {expectSaga} from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {EffectProviders} from "redux-saga-test-plan/providers";
import api from "api/";
import {Transaction} from "models/";
import {accountsSlice, transactionsSlice, transactionsRequestsSlice, toastsSlice} from "store/";
import {RollbackPayload} from "store/utils";
import {
    actionWithDummyType,
    expectSagaError,
    provideSelect,
    silenceConsoleErrors,
    SAGA_TIMEOUT
} from "utils/testHelpers";
import transactionsSaga, * as sagas from "./transactions.sagas";

const validTransaction = new Transaction({
    description: "A valid transaction description",
    amount: 100,
    type: Transaction.TRANSACTION_TYPES[0],
    creditAccountId: "a",
    debitAccountId: "b"
});

const validTransactions = [validTransaction];
const invalidTransaction = new Transaction();

describe("create sagas", () => {
    describe("createCommit", () => {
        it("can create a single transaction", () => {
            return expectSaga(sagas.createCommit, actionWithDummyType(validTransaction))
                .put(transactionsSlice.actions.add(validTransaction))
                .put(accountsSlice.actions.addTransactionToAccounts(validTransaction))
                .run();
        });

        it("throws an error if the transaction is invalid", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.createCommit, actionWithDummyType(invalidTransaction)).run()
            );
        });
    });

    describe("createEffect", () => {
        it("can request to create a new transaction", () => {
            return expectSaga(sagas.createEffect, actionWithDummyType(validTransaction))
                .provide([[matchers.call.fn(api.service("transactions").create), null]])
                .call.fn(api.service("transactions").create)
                .run();
        });
    });

    describe("createRollback", () => {
        it("can rollback creation by deleting the transaction and issuing a toast", () => {
            const payload = {rollbackData: validTransaction};

            return expectSaga(sagas.createRollback, actionWithDummyType(payload))
                .put(transactionsSlice.actions.delete(validTransaction.id))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("can abort rolling back if the API error was for trying to create a duplicate transaction", () => {
            const error = {code: 400, errors: [{message: "id must be unique"}]};
            const payload = {rollbackData: validTransaction, error};

            return expectSaga(sagas.createRollback, actionWithDummyType(payload))
                .not.put.actionType(transactionsSlice.actions.delete.type)
                .not.put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("createMany sagas", () => {
    describe("createManyCommit", () => {
        it("can create an array of transactions", () => {
            return expectSaga(sagas.createManyCommit, actionWithDummyType(validTransactions))
                .put(transactionsSlice.actions.addMany(validTransactions))
                .put(accountsSlice.actions.addTransactionsToAccounts(validTransactions))
                .run();
        });

        it("throws an error if any transaction is invalid", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.createCommit, actionWithDummyType(invalidTransaction)).run()
            );
        });
    });

    describe("createManyEffect", () => {
        it("can request to create new transactions", () => {
            return expectSaga(sagas.createManyEffect, actionWithDummyType(validTransactions))
                .provide([[matchers.call.fn(api.service("transactions").create), null]])
                .call.fn(api.service("transactions").create)
                .run();
        });
    });

    describe("createManyRollback", () => {
        it("can rollback creation by deleting the transaction and issuing a toast", () => {
            const payload = {rollbackData: validTransactions};

            return expectSaga(sagas.createManyRollback, actionWithDummyType(payload))
                .put(transactionsSlice.actions.delete(validTransaction.id))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("can rollback creation of multiple transactions", () => {
            const payload = {rollbackData: [validTransaction, validTransaction]};

            return (
                expectSaga(sagas.createManyRollback, actionWithDummyType(payload))
                    // It should fire two deletions, one for each transaction.
                    .put(transactionsSlice.actions.delete(validTransaction.id))
                    .put(transactionsSlice.actions.delete(validTransaction.id))
                    .put.actionType(toastsSlice.actions.add.type)
                    .run()
            );
        });

        it("can abort rolling back if the API error was for trying to create a duplicate transaction", () => {
            const error = {code: 400, errors: [{message: "id must be unique"}]};
            const payload = {rollbackData: validTransactions, error};

            return expectSaga(sagas.createManyRollback, actionWithDummyType(payload))
                .not.put.actionType(transactionsSlice.actions.delete.type)
                .not.put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("update sagas", () => {
    describe("updateCommit", () => {
        it("can update a transaction", () => {
            return expectSaga(sagas.updateCommit, actionWithDummyType(validTransaction))
                .provide([provideSelect()])
                .put(transactionsSlice.actions.update(validTransaction))
                .run();
        });

        it("throws an error when the updated transaction is invalid", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.updateCommit, actionWithDummyType(invalidTransaction)).run()
            );
        });
    });

    describe("updateEffect", () => {
        it("can request to update a transaction", () => {
            return expectSaga(sagas.updateEffect, actionWithDummyType(validTransaction))
                .provide([[matchers.call.fn(api.service("transactions").update), null]])
                .call.fn(api.service("transactions").update)
                .run();
        });
    });

    describe("updateRollback", () => {
        it("can rollback updates by reverting to the old transaction data and issuing a toast", () => {
            const payload = {rollbackData: validTransaction};

            return expectSaga(sagas.updateRollback, actionWithDummyType(payload))
                .put(transactionsSlice.actions.update(validTransaction))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("destroy sagas", () => {
    describe("destroyCommit", () => {
        it("can destroy a transaction", () => {
            return expectSaga(sagas.destroyCommit, actionWithDummyType(validTransaction.id))
                .provide([provideSelect(validTransaction)])
                .put(accountsSlice.actions.removeTransactionFromAccounts(validTransaction))
                .put(transactionsSlice.actions.delete(validTransaction.id))
                .run();
        });

        it("throws an error when the transaction to destroy doesn't exist", () => {
            silenceConsoleErrors();

            return expectSagaError(
                expectSaga(sagas.destroyCommit, actionWithDummyType(validTransaction.id))
                    .provide([provideSelect()])
                    .run()
            );
        });
    });

    describe("destroyEffect", () => {
        it("can request to destroy a transaction", () => {
            return expectSaga(sagas.destroyEffect, actionWithDummyType(validTransaction.id))
                .provide([[matchers.call.fn(api.service("transactions").remove), null]])
                .call.fn(api.service("transactions").remove)
                .run();
        });
    });

    describe("destroyRollback", () => {
        it("can rollback deletions by re-creating the transaction", () => {
            const payload = {rollbackData: validTransaction};

            return expectSaga(sagas.destroyRollback, actionWithDummyType(payload))
                .provide([provideSelect()])
                .put(transactionsSlice.actions.add(validTransaction))
                .put(accountsSlice.actions.addTransactionToAccounts(validTransaction))
                .put.actionType(toastsSlice.actions.add.type)
                .run();
        });

        it("can abort rolling back if the transaction already exists in the store", () => {
            const payload = {rollbackData: validTransaction};

            return expectSaga(sagas.destroyRollback, actionWithDummyType(payload))
                .provide([provideSelect(validTransaction)])
                .not.put(transactionsSlice.actions.add(validTransaction))
                .not.put(accountsSlice.actions.addTransactionToAccounts(validTransaction))
                .not.put.actionType(toastsSlice.actions.add.type)
                .run();
        });
    });
});

describe("undoableDestroy", () => {
    const action = actionWithDummyType(validTransaction.id);

    it("deletes the transaction as the first thing", () => {
        return expectSaga(sagas.undoableDestroy, action)
            .provide([provideSelect(validTransaction)])
            .put(transactionsRequestsSlice.destroy.actions.request(validTransaction.id))
            .silentRun(SAGA_TIMEOUT);
    });

    it("shows the undo toast if the destroy commit is successful", () => {
        return expectSaga(sagas.undoableDestroy, action)
            .provide([provideSelect(validTransaction)])
            .dispatch(transactionsRequestsSlice.destroy.actions.success())
            .put.actionType(toastsSlice.actions.add.type)
            .silentRun(SAGA_TIMEOUT);
    });

    it("recreates the transaction if the user chooses to undo and shows a success toast when it's recreated", () => {
        // Since we can't know the exact payload for the undo toast, we just manually mock the race.
        const provideToastUndo = (): EffectProviders => ({
            race: (effect, next) => {
                if ("undo" in effect && effect.undo) {
                    return {undo: true};
                }

                return next();
            }
        });

        return (
            expectSaga(sagas.undoableDestroy, action)
                .provide([provideSelect(validTransaction), provideToastUndo()])
                .dispatch(transactionsRequestsSlice.destroy.actions.success())
                .dispatch(transactionsRequestsSlice.create.actions.success())
                // First show the undo toast...
                .put.actionType(toastsSlice.actions.add.type)
                // Then recreate the transaction...
                .put(transactionsRequestsSlice.create.actions.request(validTransaction))
                // Finally show the success toast.
                .put.actionType(toastsSlice.actions.add.type)
                .run()
        );
    });

    it("doesn't recreate the transaction if the user doesn't choose to undo", () => {
        const provideToastClose = (): EffectProviders => ({
            race: (effect, next) => {
                if ("close" in effect && effect.close) {
                    return {close: true};
                }

                return next();
            }
        });

        return (
            expectSaga(sagas.undoableDestroy, action)
                .provide([provideSelect(validTransaction), provideToastClose()])
                .dispatch(transactionsRequestsSlice.destroy.actions.success())
                .dispatch(transactionsRequestsSlice.create.actions.success())
                // First show the undo toast...
                .put.actionType(toastsSlice.actions.add.type)
                // Then recreation shouldn't happen...
                .not.put(transactionsRequestsSlice.create.actions.request(validTransaction))
                // Nor should the success toast.
                .not.put.actionType(toastsSlice.actions.add.type)
                .run()
        );
    });

    it("just returns if the destroy commit fails", () => {
        return (
            expectSaga(sagas.undoableDestroy, action)
                .provide([provideSelect(validTransaction)])
                .dispatch(transactionsRequestsSlice.destroy.actions.failure)
                // Shouldn't show the undo toast.
                .not.put.actionType(toastsSlice.actions.add.type)
                .run()
        );
    });
});

describe("saga registration", () => {
    describe("create", () => {
        it("has the commit saga registered", () => {
            return expectSaga(transactionsSaga)
                .dispatch(transactionsRequestsSlice.create.actions.request(validTransaction))
                .put(transactionsRequestsSlice.create.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([[matchers.call.fn(api.service("transactions").create), null]])
                .dispatch(transactionsRequestsSlice.create.actions.effectStart())
                .put(transactionsRequestsSlice.create.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(transactionsSaga)
                .dispatch(
                    transactionsRequestsSlice.create.actions.rollbackStart(
                        new RollbackPayload({rollbackData: validTransaction})
                    )
                )
                .put(transactionsRequestsSlice.create.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("createMany", () => {
        it("has the commit saga registered", () => {
            return expectSaga(transactionsSaga)
                .dispatch(transactionsRequestsSlice.createMany.actions.request([]))
                .put(transactionsRequestsSlice.createMany.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([[matchers.call.fn(api.service("transactions").create), null]])
                .dispatch(transactionsRequestsSlice.createMany.actions.effectStart())
                .put(transactionsRequestsSlice.createMany.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(transactionsSaga)
                .dispatch(
                    transactionsRequestsSlice.createMany.actions.rollbackStart(
                        new RollbackPayload({rollbackData: []})
                    )
                )
                .put(transactionsRequestsSlice.createMany.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("update", () => {
        it("has the commit saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([provideSelect()])
                .dispatch(transactionsRequestsSlice.update.actions.request(validTransaction))
                .put(transactionsRequestsSlice.update.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([[matchers.call.fn(api.service("transactions").update), null]])
                .dispatch(transactionsRequestsSlice.update.actions.effectStart(validTransaction))
                .put(transactionsRequestsSlice.update.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(transactionsSaga)
                .dispatch(
                    transactionsRequestsSlice.update.actions.rollbackStart(
                        new RollbackPayload({
                            rollbackData: validTransaction
                        })
                    )
                )
                .put(transactionsRequestsSlice.update.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("destroy", () => {
        it("has the commit saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([provideSelect(validTransaction)])
                .dispatch(transactionsRequestsSlice.destroy.actions.request(validTransaction.id))
                .put(transactionsRequestsSlice.destroy.actions.success())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the commit failure saga registered", () => {
            return expectSaga(transactionsSaga)
                .dispatch(transactionsRequestsSlice.destroy.actions.failure({message: ""}))
                .put.actionType(toastsSlice.actions.add.type)
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the effect saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([[matchers.call.fn(api.service("transactions").remove), null]])
                .dispatch(
                    transactionsRequestsSlice.destroy.actions.effectStart(validTransaction.id)
                )
                .put(transactionsRequestsSlice.destroy.actions.effectSuccess())
                .silentRun(SAGA_TIMEOUT);
        });

        it("has the rollback saga registered", () => {
            return expectSaga(transactionsSaga)
                .provide([provideSelect(validTransaction)])
                .dispatch(
                    transactionsRequestsSlice.destroy.actions.rollbackStart(
                        new RollbackPayload({
                            rollbackData: validTransaction
                        })
                    )
                )
                .put(transactionsRequestsSlice.destroy.actions.rollbackSuccess())
                .silentRun(SAGA_TIMEOUT);
        });
    });

    describe("undoableDestroy", () => {
        it("is registered", () => {
            return expectSaga(transactionsSaga)
                .provide([provideSelect(validTransaction)])
                .dispatch(transactionsSlice.actions.undoableDestroyTransaction(validTransaction.id))
                .put(transactionsRequestsSlice.destroy.actions.request(validTransaction.id))
                .silentRun(SAGA_TIMEOUT);
        });
    });
});
