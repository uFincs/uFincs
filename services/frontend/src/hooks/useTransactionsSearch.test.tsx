import {act} from "@testing-library/react";
import {Transaction} from "models/";
import {storyData, useCreateAccounts, useCreateTransactions} from "utils/stories";
import {renderHooksWithRedux} from "utils/testHelpers";
import {useTransactionsSearch, TransactionsSearchProvider} from "./useTransactionsSearch";

const Wrapper = ({children, ...otherProps}: any) => (
    <TransactionsSearchProvider {...otherProps}>{children}</TransactionsSearchProvider>
);

const renderHooks = () =>
    renderHooksWithRedux(
        () => {
            // Yes, we're leveraging the story data as test data. Deal with it.
            useCreateAccounts(storyData.accounts);
            useCreateTransactions(storyData.transactions);

            return useTransactionsSearch();
        },
        {wrapper: Wrapper}
    );

describe("useTransactionsSearch", () => {
    it("can get all of the initial transactions search state", () => {
        const {result} = renderHooks();

        expect(result.current.state.query).toBe("");
        expect(result.current.state.results).toEqual([]);
        expect(result.current.state.selectedTransaction).toBe(null);
    });

    it("can search up some transactions", () => {
        const query = "money";
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.searchTransactions(query);
        });

        expect(result.current.state.query).toBe(query);

        expect(result.current.state.results.length).not.toBe(0);
        expect(result.current.state.results[0]).toBeInstanceOf(Transaction);
        expect(result.current.state.results[0].description).toContain(query);
    });

    it("can set a selected transaction", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.searchTransactions("money");
        });

        act(() => {
            result.current.dispatch.setSelectedTransactionId(result.current.state.results[0].id);
        });

        expect(result.current.state.selectedTransaction).toBeInstanceOf(Transaction);

        expect(result.current.state?.selectedTransaction?.id).toBe(
            result.current.state.results[0].id
        );
    });

    it("can clear the selected transaction", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.searchTransactions("money");
        });

        act(() => {
            result.current.dispatch.setSelectedTransactionId(result.current.state.results[0].id);
        });

        act(() => {
            result.current.dispatch.setSelectedTransactionId(null);
        });

        expect(result.current.state.selectedTransaction).toBe(null);
    });
});
