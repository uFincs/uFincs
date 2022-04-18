import {act, renderHook} from "@testing-library/react-hooks";
import React from "react";
import {Transaction} from "models/";
import useFilterTransactionsByType from "./useFilterTransactionsByType";
import {useTransactionTypes, TransactionTypesProvider} from "./useTransactionTypes";

const mockTransactions = [
    new Transaction({type: Transaction.INCOME}),
    new Transaction({type: Transaction.EXPENSE}),
    new Transaction({type: Transaction.DEBT}),
    new Transaction({type: Transaction.TRANSFER})
];

const Wrapper = ({children}: any) => (
    <TransactionTypesProvider>{children}</TransactionTypesProvider>
);

const renderHooks = (transactions = mockTransactions) =>
    renderHook(
        () => {
            const {dispatch} = useTransactionTypes();
            const filteredTransactions = useFilterTransactionsByType(transactions);

            return {filteredTransactions, dispatch};
        },
        {wrapper: Wrapper}
    );

describe("useFilterTransactionsByType", () => {
    it("doesn't do any filtering when all the types are enabled", () => {
        const {result} = renderHooks();

        expect(result.current.filteredTransactions).toEqual(mockTransactions);
    });

    it("can disable a type to filter out those transactions", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.toggleType(Transaction.INCOME);
        });

        expect(result.current.filteredTransactions.length).toBe(3);

        for (const transaction of result.current.filteredTransactions) {
            expect(transaction.type).not.toBe(Transaction.INCOME);
        }
    });

    it("can disable multiples types to filter them out", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.toggleType(Transaction.INCOME);
        });

        act(() => {
            result.current.dispatch.toggleType(Transaction.EXPENSE);
        });

        expect(result.current.filteredTransactions.length).toBe(2);

        for (const transaction of result.current.filteredTransactions) {
            expect(transaction.type).not.toBe(Transaction.INCOME);
            expect(transaction.type).not.toBe(Transaction.EXPENSE);
        }
    });

    it("can disable every type to filter every transaction out", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.toggleType(Transaction.INCOME);
        });

        act(() => {
            result.current.dispatch.toggleType(Transaction.EXPENSE);
        });

        act(() => {
            result.current.dispatch.toggleType(Transaction.DEBT);
        });

        act(() => {
            result.current.dispatch.toggleType(Transaction.TRANSFER);
        });

        expect(result.current.filteredTransactions.length).toBe(0);
    });
});
