import {expectSaga} from "redux-saga-test-plan";
import {Transaction} from "models/";
import {transactionsIndexSlice} from "store/";
import {actionWithDummyType} from "utils/testHelpers";
import {indexOnCreate, indexOnSet, indexOnDelete, indexOnUpdate} from "./transactionsIndex.sagas";

const transaction1 = new Transaction({description: "test"});
const transaction2 = new Transaction({description: "yolo"});

const transactions = [transaction1, transaction2];

const transactionsById = {
    [transaction1.id]: transaction1,
    [transaction2.id]: transaction2
};

describe("indexOnCreate", () => {
    it("can add a single transaction to the index", () => {
        return expectSaga(indexOnCreate, actionWithDummyType(transaction1))
            .put(transactionsIndexSlice.actions.addTransaction(transaction1))
            .run();
    });

    it("can add a set of transactions to the index", () => {
        return expectSaga(indexOnCreate, actionWithDummyType(transactions))
            .put(transactionsIndexSlice.actions.addTransactions(transactions))
            .run();
    });
});

describe("indexOnSet", () => {
    it("can set a set of transactions onto the index", () => {
        return expectSaga(indexOnSet, actionWithDummyType(transactionsById))
            .put(transactionsIndexSlice.actions.setTransactions(transactionsById))
            .run();
    });
});

describe("indexOnDelete", () => {
    it("can delete a transaction from the index", () => {
        return expectSaga(indexOnDelete, actionWithDummyType(transaction1.id))
            .put(transactionsIndexSlice.actions.deleteTransaction(transaction1.id))
            .run();
    });
});

describe("indexOnUpdate", () => {
    it("can update a transaction in the index", () => {
        return expectSaga(indexOnUpdate, actionWithDummyType(transaction1))
            .put(transactionsIndexSlice.actions.updateTransaction(transaction1))
            .run();
    });
});
