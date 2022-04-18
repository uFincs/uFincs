import {useMemo} from "react";
import {TransactionData} from "models/";
import {useTransactionTypes} from "./useTransactionTypes";

/** Filter the given set of transactions using the transaction type Context state. */
const useFilterTransactionsByType = (
    transactions: Array<TransactionData>
): Array<TransactionData> => {
    // Disable error checking for the Transaction Types Provider so that we can just pass through
    // the transactions unfiltered when type filtering isn't used.
    const {state} = useTransactionTypes({disableErrorCheck: true});

    return useMemo(() => {
        if (state === undefined) {
            return transactions;
        } else {
            return transactions.filter(({type}) => state[type]);
        }
    }, [transactions, state]);
};

export default useFilterTransactionsByType;
