import React from "react";
import {CombinedTransactionsView} from "components/organisms";
import connect, {ConnectedProps} from "./connect";

interface CombinedRecurringTransactionsViewProps extends ConnectedProps {}

/** It's like `CombinedTransactionsView` except for recurring transactions. */
const CombinedRecurringTransactionsView = ({
    transactions,
    transactionSelector,
    transactionsSelector,
    onDeleteTransaction,
    onEditTransaction
}: CombinedRecurringTransactionsViewProps) => (
    <CombinedTransactionsView
        isRecurringTransactions={true}
        transactions={transactions}
        transactionSelector={transactionSelector}
        transactionsSelector={transactionsSelector}
        onDeleteTransaction={onDeleteTransaction}
        onEditTransaction={onEditTransaction}
    />
);

export default connect(CombinedRecurringTransactionsView);
