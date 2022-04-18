import {Transaction} from "models/";
import {
    initialState,
    transactionsDateIndexSlice,
    TransactionsDateIndexSliceState
} from "./transactionsDateIndex.slice";

// Note: The vast majority of the testing for the logic behind this slice is done in DateIndex.
// That's why these tests will be much less thorough; more just sanity testing than anything.

const createNewState = (newState: Partial<TransactionsDateIndexSliceState>) => ({
    ...initialState,
    ...newState
});

describe("reducer", () => {
    const {actions, reducer} = transactionsDateIndexSlice;

    const transaction1 = new Transaction({id: "1", date: "2020-07-30"});
    const transaction2 = new Transaction({id: "2", date: "2020-08-05"});
    const transaction3 = new Transaction({id: "3", date: "2020-08-05"});

    const transactions = [transaction1, transaction2, transaction3];

    const id1 = transaction1.id;
    const id2 = transaction2.id;
    const id3 = transaction3.id;

    const transaction1State = createNewState({
        byDate: {
            2020: {
                6: {
                    30: [id1]
                }
            }
        }
    });

    const transaction1And2State = createNewState({
        byDate: {
            2020: {
                6: {
                    30: [id1]
                },
                7: {
                    5: [id2]
                }
            }
        }
    });

    const allTransactionsState = createNewState({
        byDate: {
            2020: {
                6: {
                    30: [id1]
                },
                7: {
                    5: [id2, id3]
                }
            }
        }
    });

    it("add a new transaction to the index", () => {
        expect(reducer(initialState, actions.addTransaction(transaction1))).toEqual(
            transaction1State
        );

        expect(reducer(transaction1State, actions.addTransaction(transaction2))).toEqual(
            transaction1And2State
        );
    });

    it("doesn't change anything when adding an existing transaction", () => {
        expect(reducer(transaction1State, actions.addTransaction(transaction1))).toEqual(
            transaction1State
        );
    });

    it("can add a set of new transactions to the index", () => {
        expect(reducer(initialState, actions.addTransactions([transaction1]))).toEqual(
            transaction1State
        );

        expect(
            reducer(initialState, actions.addTransactions([transaction1, transaction2]))
        ).toEqual(transaction1And2State);

        expect(reducer(initialState, actions.addTransactions(transactions))).toEqual(
            allTransactionsState
        );
    });

    it("doesn't change anything when adding multiple existing transactions", () => {
        expect(reducer(transaction1State, actions.addTransactions([transaction1]))).toEqual(
            transaction1State
        );

        expect(reducer(allTransactionsState, actions.addTransactions(transactions))).toEqual(
            allTransactionsState
        );
    });

    it("can reset the index to only have a certain set of transactions", () => {
        expect(
            reducer(allTransactionsState, actions.setTransactions({[id1]: transaction1}))
        ).toEqual(transaction1State);
    });

    it("can delete a transaction from the index", () => {
        expect(reducer(transaction1And2State, actions.deleteTransaction(id2))).toEqual(
            transaction1State
        );

        expect(reducer(allTransactionsState, actions.deleteTransaction(id3))).toEqual(
            transaction1And2State
        );
    });

    it("can update a transaction in the index", () => {
        const updatedTransaction3 = new Transaction({...transaction3, date: "2030-01-01"});

        const updatedAllTransactionsState = createNewState({
            byDate: {
                ...transaction1And2State.byDate,
                2030: {
                    0: {
                        1: [id3]
                    }
                }
            }
        });

        expect(
            reducer(allTransactionsState, actions.updateTransaction(updatedTransaction3))
        ).toEqual(updatedAllTransactionsState);
    });

    it("adds the transaction when the transaction isn't yet in the index", () => {
        expect(reducer(initialState, actions.updateTransaction(transaction1))).toEqual(
            transaction1State
        );
    });
});
