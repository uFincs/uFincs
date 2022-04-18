import {useMemo} from "react";
import {useSelector} from "react-redux";
import {useDateRangeTransactionsWithSearch, useFilterTransactionsByType} from "hooks/";
import {Account} from "models/";
import {accountsSlice} from "store/";

export const useTransactionsSummary = () => {
    const accounts = useSelector(accountsSlice.selectors.selectAccounts);
    const transactions = useFilterTransactionsByType(useDateRangeTransactionsWithSearch());

    const balanceChanges = useMemo(
        () => Object.values(Account.calculateAccountsBalanceChanges(accounts, transactions)),
        [accounts, transactions]
    );

    return useMemo(() => {
        const incomeAccounts = [];
        const expenseAccounts = [];

        let incomeTotal = 0;
        let expenseTotal = 0;

        for (let i = 0; i < balanceChanges.length; i++) {
            const account = balanceChanges[i];

            if (!account.balance) {
                continue;
            }

            if (account.type === Account.INCOME) {
                incomeTotal += account.balance;
                incomeAccounts.push(account);
            } else if (account.type === Account.EXPENSE) {
                expenseTotal += account.balance;
                expenseAccounts.push(account);
            }
        }

        incomeAccounts.sort(Account.balanceSortDesc);
        expenseAccounts.sort(Account.balanceSortDesc);

        const cashFlow = incomeTotal - expenseTotal;

        return {
            expenseAccounts,
            incomeAccounts,
            cashFlow
        };

        // Stringification optimization to preserve references.
        // eslint-disable-next-line
    }, [JSON.stringify(balanceChanges)]);
};
