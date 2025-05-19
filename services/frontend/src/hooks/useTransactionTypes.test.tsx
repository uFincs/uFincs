import {act, renderHook} from "@testing-library/react";
import {Transaction} from "models/";
import {useTransactionTypes, TransactionTypesProvider} from "./useTransactionTypes";

const Wrapper = ({children}: any) => (
    <TransactionTypesProvider>{children}</TransactionTypesProvider>
);

const renderHooks = () => renderHook(() => useTransactionTypes(), {wrapper: Wrapper});

describe("useTransactionTypes", () => {
    it("has all types enabled as the initial state", () => {
        const {result} = renderHooks();

        for (const type of Transaction.TRANSACTION_TYPES) {
            expect(result.current.state[type]).toBe(true);
        }
    });

    it("can toggle a type to disable the filter", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.toggleType(Transaction.INCOME);
        });

        expect(result.current.state.income).toBe(false);
    });

    it("can toggle a type twice to disable then re-enable the filter", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.toggleType(Transaction.INCOME);
        });

        act(() => {
            result.current.dispatch.toggleType(Transaction.INCOME);
        });

        expect(result.current.state.income).toBe(true);
    });
});
