import {useMemo} from "react";
import {Account, AccountData, TransactionData} from "models/";
import {Cents, Id} from "utils/types";

/** Creates an `ID -> balance` map of the running balances for an account's transactions. */
const useCalculateRunningBalances = (
    transactions: Array<TransactionData>,
    account: AccountData | undefined,
    startingBalance: Cents | undefined
): Record<Id, Cents> =>
    useMemo(
        () => Account.calculateRunningBalances(transactions, account, startingBalance),
        [transactions, account, startingBalance]
    );

export default useCalculateRunningBalances;
