import {useMemo} from "react";
import {TransactionData} from "models/";

/** Intersects two arrays of transactions. Useful when intersecting, for example, a set of
 *  search result transactions and a set of date range filtered transactions.
 *
 *  'ignoreEmpty' means to ignore the fact that intersecting with an empty array would result
 *  in an empty array; instead, just take the non-empty array. */
const useIntersectTransactions = (
    transactions1: Array<TransactionData>,
    transactions2: Array<TransactionData>,
    ignoreEmpty = true
): Array<TransactionData> =>
    useMemo(() => {
        if (transactions1.length === 0 && ignoreEmpty) {
            return transactions2;
        } else if (transactions2.length === 0 && ignoreEmpty) {
            return transactions1;
        } else {
            return intersectTransactions(transactions1, transactions2);
        }
    }, [transactions1, transactions2, ignoreEmpty]);

export default useIntersectTransactions;

/* Helper Functions */

const intersectTransactions = (
    transactions1: Array<TransactionData>,
    transactions2: Array<TransactionData>
) => {
    const ids2 = transactions2.reduce(
        (acc, {id}) => {
            acc[id] = id;
            return acc;
        },
        {} as Record<string, string>
    );

    const result: Array<TransactionData> = [];

    for (let i = 0; i < transactions1.length; i++) {
        const transaction = transactions1[i];

        if (transaction.id in ids2) {
            result.push(transaction);
        }
    }

    return result;
};
