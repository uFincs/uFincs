import React from "react";
import {TransactionsList, TransactionsTable} from "components/organisms";
import {useWindowWidthBreakpoint} from "hooks/";
import {TransactionViewProps} from "utils/componentTypes";
import {navigationBreakpointMatches} from "utils/mediaQueries";
import "./CombinedTransactionsView.scss";

interface CombinedTransactionsViewProps extends TransactionViewProps {}

/** The combination of the `TransactionsList` (mobile) and `TransactionsTable` (desktop) to
 *  create a single responsive view for displaying transactions. */
const CombinedTransactionsView = React.memo((props: CombinedTransactionsViewProps) => {
    const showTable = useWindowWidthBreakpoint(navigationBreakpointMatches);

    return (
        <>
            {showTable && (
                <TransactionsTable
                    className="Transactions-desktop-table"
                    data-testid="transactions-table-desktop"
                    {...props}
                />
            )}

            {!showTable && (
                <TransactionsList
                    className="Transactions-mobile-list"
                    data-testid="transactions-list-mobile"
                    {...props}
                />
            )}
        </>
    );
});

export default CombinedTransactionsView;
