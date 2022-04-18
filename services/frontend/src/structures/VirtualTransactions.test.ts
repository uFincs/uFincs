import {RecurringTransactionData, TransactionData} from "models";
import {
    recurringTransaction,
    startDate,
    endDate,
    expectedDates
} from "models/RecurringTransaction.test";
import {DateService} from "services/";
import {deepClone} from "utils/helperFunctions";
import VirtualTransactions from "./VirtualTransactions";

const virtualTransactions = new VirtualTransactions();
const expectedDateStrings = expectedDates.map(DateService.convertToUTCString);

const expectTransaction = (
    transaction: TransactionData,
    recurringTransaction: RecurringTransactionData
) => {
    const {
        creditAccountId,
        debitAccountId,
        recurringTransactionId,
        amount,
        description,
        notes,
        type
    } = transaction;

    expect(creditAccountId).toBe(recurringTransaction.creditAccountId);
    expect(debitAccountId).toBe(recurringTransaction.debitAccountId);
    expect(recurringTransactionId).toBe(recurringTransaction.id);
    expect(amount).toBe(recurringTransaction.amount);
    expect(description).toBe(recurringTransaction.description);
    expect(notes).toBe(recurringTransaction.notes);
    expect(type).toBe(recurringTransaction.type);

    expect(transaction.id).not.toBeUndefined();
    expect(transaction.createdAt).not.toBeUndefined();
    expect(transaction.updatedAt).not.toBeUndefined();
};

describe("add", () => {
    it("does nothing if the endDate isn't specified", () => {
        expect(
            VirtualTransactions.add(
                // Need to deep clone since the function mutates the original.
                deepClone(virtualTransactions),
                recurringTransaction,
                startDate,
                ""
            )
        ).toEqual(virtualTransactions);
    });

    it("does nothing if start and end date aren't specified", () => {
        expect(
            VirtualTransactions.add(deepClone(virtualTransactions), recurringTransaction, "", "")
        ).toEqual(virtualTransactions);
    });

    it("can realize a recurring transaction and add the transactions to the structure", () => {
        const datesSlice = expectedDateStrings.slice(3, 4);

        const newVirtualTransactions = VirtualTransactions.add(
            deepClone(virtualTransactions),
            recurringTransaction,
            datesSlice[0],
            endDate
        );

        expect(Object.keys(newVirtualTransactions.byId).length).toBe(datesSlice.length);

        const idsByDate = newVirtualTransactions.byRecurringTransactionId[recurringTransaction.id];
        expect(Object.keys(idsByDate)).toEqual(datesSlice);

        for (const date in idsByDate) {
            const id = idsByDate[date];
            const transaction = newVirtualTransactions.byId[id];

            expectTransaction(transaction, recurringTransaction);
        }
    });

    it("uses the recurring transaction's start date when start date isn't specified", () => {
        const newVirtualTransactions = VirtualTransactions.add(
            deepClone(virtualTransactions),
            recurringTransaction,
            "",
            endDate
        );

        expect(Object.keys(newVirtualTransactions.byId).length).toBe(expectedDates.length);

        const idsByDate = newVirtualTransactions.byRecurringTransactionId[recurringTransaction.id];
        expect(Object.keys(idsByDate)).toEqual(expectedDateStrings);

        for (const date in idsByDate) {
            const id = idsByDate[date];
            const transaction = newVirtualTransactions.byId[id];

            expectTransaction(transaction, recurringTransaction);
        }
    });

    it("re-uses already created transactions (i.e. caching)", () => {
        const newVirtualTransactions = VirtualTransactions.add(
            deepClone(virtualTransactions),
            recurringTransaction,
            startDate,
            endDate
        );

        const newVirtualTransactions2 = VirtualTransactions.add(
            deepClone(newVirtualTransactions),
            recurringTransaction,
            startDate,
            endDate
        );

        expect(newVirtualTransactions).toEqual(newVirtualTransactions2);
    });
});

const deleteTests = () => {
    const newVirtualTransactions = VirtualTransactions.add(
        deepClone(virtualTransactions),
        recurringTransaction,
        "",
        endDate
    );

    it("removes all the realized transactions for the given recurring transaction", () => {
        const newVirtualTransactions2 = VirtualTransactions.delete(
            deepClone(newVirtualTransactions),
            recurringTransaction.id
        );

        expect(newVirtualTransactions2.byId).toEqual({});
        expect(newVirtualTransactions2.byRecurringTransactionId).toEqual({});
    });
};

describe("delete", deleteTests);

describe("update", deleteTests);

describe("findBetween", () => {
    const newVirtualTransactions = VirtualTransactions.add(
        deepClone(virtualTransactions),
        recurringTransaction,
        "",
        endDate
    );

    it("can find transactions between the given dates", () => {
        const result = VirtualTransactions.findBetween(
            newVirtualTransactions,
            [recurringTransaction],
            startDate,
            endDate
        );

        expect(result.length).toBe(expectedDates.length);

        for (const transaction of result) {
            expectTransaction(transaction, recurringTransaction);
        }
    });
});
