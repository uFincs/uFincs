import classNames from "classnames";
import React from "react";
import {TransactionsList} from "components/organisms";
import {useDateRangeTransactions, useTransformTransactionsList} from "hooks/";
import {TransactionViewProps} from "utils/componentTypes";
import "./RecentTransactionsList.scss";

interface RecentTransactionsListProps extends TransactionViewProps {
    /** Custom class name. */
    className?: string;
}

/** A version of the (mobile) `TransactionsList` that just shows the last 5 transactions
 *  for the current date range. */
const RecentTransactionsList = React.memo(
    ({className, ...otherProps}: RecentTransactionsListProps) => (
        <div
            className={classNames("RecentTransactionsList", className)}
            data-testid="recent-transactions-list"
        >
            <h2 className="RecentTransactionsList-header">Last 5 Transactions for Period</h2>

            <TransactionsList {...otherProps} />
        </div>
    )
);

const WrappedRecentTransactionsList = (
    props: Omit<RecentTransactionsListProps, "transactions">
) => {
    const allTransactions = useDateRangeTransactions();

    // Need to apply the transforms, mostly to get the transactions sorted date descending.
    // Otherwise, we'll end up slicing off the wrong transactions.
    const {filteredTransactions} = useTransformTransactionsList(allTransactions);

    return <RecentTransactionsList transactions={filteredTransactions.slice(0, 5)} {...props} />;
};

export const PureComponent = RecentTransactionsList;
export default WrappedRecentTransactionsList;
