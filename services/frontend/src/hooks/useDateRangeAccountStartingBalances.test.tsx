import {act} from "@testing-library/react-hooks";
import React from "react";
import {Account, Transaction} from "models/";
import {useCreateAccounts, useCreateTransactions} from "utils/stories";
import {renderHooksWithRedux} from "utils/testHelpers";
import {UTCDateString} from "utils/types";
import {useDateRangeDispatch, DateRangeProvider, DateRangeSize} from "./useDateRange";
import useDateRangeAccountStartingBalances from "./useDateRangeAccountStartingBalances";

const Wrapper = ({children}: any) => <DateRangeProvider>{children}</DateRangeProvider>;

const renderHooks = (account: Account | undefined, transactions: Array<Transaction>) =>
    renderHooksWithRedux(
        () => {
            if (account) {
                useCreateAccounts([account]);
            }

            useCreateTransactions(transactions);

            const dispatch = useDateRangeDispatch();
            const balances = useDateRangeAccountStartingBalances(account?.id);

            return {balances, dispatch};
        },
        {wrapper: Wrapper}
    );

const setMonthlyDateRange = (dispatch: ReturnType<typeof useDateRangeDispatch>) => {
    act(() => {
        dispatch.setStartDate("2020-07-01" as UTCDateString);
    });

    act(() => {
        dispatch.setEndDate("2020-07-31" as UTCDateString);
    });
};

const setAllTimeDateRange = (dispatch: ReturnType<typeof useDateRangeDispatch>) => {
    act(() => {
        dispatch.setRangeSize(DateRangeSize.allTime);
    });
};

describe("useDateRangeAccountStartingBalances", () => {
    describe("Invalid Account", () => {
        it("returns 0 for both balances", () => {
            const {result} = renderHooks(undefined, []);

            setMonthlyDateRange(result.current.dispatch);

            expect(result.current.balances.fromBalance).toBe(0);
            expect(result.current.balances.startingBalance).toBe(0);
        });
    });

    // Liability accounts are covered by asset account tests.
    describe("Asset Account", () => {
        const account = new Account({type: Account.ASSET, openingBalance: 1000});
        const {id} = account;

        const transaction1 = new Transaction({
            date: "2020-06-15",
            type: Transaction.EXPENSE,
            amount: 1000,
            creditAccountId: id
        });

        const transaction2 = new Transaction({
            date: "2020-06-20",
            type: Transaction.INCOME,
            amount: 2000,
            debitAccountId: id
        });

        const transactions = [transaction1, transaction2];

        describe("Regular date range", () => {
            it(`can get the starting balance and the from balance as the same thing,
                which is the total balance leading up to the current date range`, () => {
                const {result} = renderHooks(account, transactions);

                setMonthlyDateRange(result.current.dispatch);

                expect(result.current.balances.fromBalance).toBe(2000);
                expect(result.current.balances.startingBalance).toBe(2000);
            });
        });

        describe("All Time date range", () => {
            it(`can get the starting balance and the from balance as the same thing,
                which is the account's opening balance`, () => {
                const {result} = renderHooks(account, transactions);

                setAllTimeDateRange(result.current.dispatch);

                expect(result.current.balances.fromBalance).toBe(account.openingBalance);
                expect(result.current.balances.startingBalance).toBe(account.openingBalance);
            });
        });
    });

    // Expense accounts are covered by income account tests.
    describe("Income Account", () => {
        const account = new Account({type: Account.INCOME});
        const {id} = account;

        const transaction1 = new Transaction({
            date: "2020-06-15",
            type: Transaction.INCOME,
            amount: 1000,
            creditAccountId: id
        });

        const transaction2 = new Transaction({
            date: "2020-06-20",
            type: Transaction.INCOME,
            amount: 2000,
            creditAccountId: id
        });

        const transactions = [transaction1, transaction2];

        describe("Regular date range", () => {
            it(`can get the from balance as the last interval's balance and 
                the starting balance as 0`, () => {
                const {result} = renderHooks(account, transactions);

                setMonthlyDateRange(result.current.dispatch);

                expect(result.current.balances.fromBalance).toBe(3000);
                expect(result.current.balances.startingBalance).toBe(0);
            });
        });

        describe("All Time date range", () => {
            it(`can get the starting balance and the from balance as the same thing,
                which is the account's opening balance`, () => {
                const {result} = renderHooks(account, transactions);

                setAllTimeDateRange(result.current.dispatch);

                expect(result.current.balances.fromBalance).toBe(account.openingBalance);
                expect(result.current.balances.startingBalance).toBe(account.openingBalance);
            });
        });
    });
});
