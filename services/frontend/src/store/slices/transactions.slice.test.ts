import {Transaction} from "models/";
import {transactionsSlice} from "./transactions.slice";

describe("transactions reducer", () => {
    const {reducer, actions} = transactionsSlice;

    const transaction = new Transaction({id: "1"});
    const transactions = {[transaction.id]: transaction};

    it("can set transactions", () => {
        expect(reducer(undefined, actions.set(transactions))).toEqual(transactions);
    });

    it("can add a transaction", () => {
        expect(reducer(undefined, actions.add(transaction))).toEqual(transactions);
    });

    it("can delete a transaction", () => {
        expect(reducer(transactions, actions.delete(transaction.id))).toEqual({});
    });
});
