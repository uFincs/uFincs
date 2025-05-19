import classNames from "classnames";
import {useMemo} from "react";
import {
    EmptyTransactionsArea,
    TransactionsTableColumnHeaders,
    TransactionsTableRow
} from "components/molecules";
import {useCalculateRunningBalances, useIsLargeWidth} from "hooks/";
import {crossSliceSelectors, TransactionSelector} from "store/";
import {DefaultListItemActions, ListItemActions, TransactionViewProps} from "utils/componentTypes";
import {generateAnimatedList, generateAnimationCalculator} from "utils/listAnimation";
import {transactionsTableLargeWidth} from "utils/parsedStyles";
import {Cents, Id} from "utils/types";
import {useTransactionsTable} from "./hooks";
import "./TransactionsTable.scss";

/** Generates the (animated) rows for the table.
 *
 *  Note: Because it has JSX in it, we prefer to have it in the component rather than the hooks
 *  file, since theoretically the hooks file is completely independent from the component. */
const useGenerateRows = ({
    ids,
    isLargeWidth,
    isRecurringTransactions,
    runningBalances,
    actionsToShow,
    transactionSelector,
    onDeleteTransaction,
    onEditTransaction
}: {
    ids: Array<Id>;
    isLargeWidth: boolean;
    isRecurringTransactions: boolean;
    runningBalances: Record<Id, Cents>;
    actionsToShow: ListItemActions;
    transactionSelector?: TransactionSelector;
    onDeleteTransaction?: (id: Id) => void;
    onEditTransaction?: (id: Id) => void;
}) =>
    useMemo(
        () =>
            generateAnimatedList((indexCalculator) =>
                ids.map((id, index) => {
                    const animationCalculator = generateAnimationCalculator(indexCalculator());

                    return (
                        <TransactionsTableRow
                            key={id}
                            id={id}
                            index={index}
                            isLargeWidth={isLargeWidth}
                            isRecurringTransaction={isRecurringTransactions}
                            actionsToShow={actionsToShow}
                            runningBalance={runningBalances[id]}
                            style={animationCalculator()}
                            transactionSelector={transactionSelector}
                            customOnDelete={
                                onDeleteTransaction ? () => onDeleteTransaction(id) : undefined
                            }
                            customOnEdit={
                                onEditTransaction ? () => onEditTransaction(id) : undefined
                            }
                        />
                    );
                })
            ),
        // Performance optimization. See TransactionsList.tsx for full explanation.
        // eslint-disable-next-line
        [JSON.stringify(ids), JSON.stringify(runningBalances)]
    );

interface TransactionsTableProps extends TransactionViewProps {}

/** A table of transactions. Used on large screens, whereas the `TransactionsList`
 *  is used on smaller displays. */
const TransactionsTable = ({
    className,
    "data-testid": dataTestId,
    account,
    accountStartingBalance,
    actionsToShow = DefaultListItemActions,
    isRecurringTransactions = false,
    transactions = [],
    transactionSelector,
    transactionsSelector = crossSliceSelectors.transactions.selectTransactionsById,
    onDeleteTransaction,
    onEditTransaction,
    ...otherProps
}: TransactionsTableProps) => {
    const {isLargeWidth, containerRef: tableRef} = useIsLargeWidth<HTMLTableElement>(
        transactionsTableLargeWidth
    );

    const {ids, sortState, onKeyDown, onSortChange} = useTransactionsTable(
        transactions,
        transactionsSelector
    );

    const runningBalances = useCalculateRunningBalances(
        transactions,
        account,
        accountStartingBalance
    );

    const transactionsExist = ids.length > 0;

    const tableRows = useGenerateRows({
        ids,
        isLargeWidth,
        isRecurringTransactions,
        runningBalances,
        actionsToShow,
        transactionSelector,
        onDeleteTransaction,
        onEditTransaction
    });

    return transactionsExist ? (
        <table
            className={classNames(
                "TransactionsTable",
                {
                    "TransactionsTable--full": isLargeWidth,
                    "TransactionsTable--running-balance": accountStartingBalance !== undefined
                },
                className
            )}
            data-testid={dataTestId}
            ref={tableRef}
            onKeyDown={onKeyDown}
            {...otherProps}
        >
            <thead className="TransactionsTable-head">
                <TransactionsTableColumnHeaders
                    enableRunningBalance={accountStartingBalance !== undefined}
                    isLargeWidth={isLargeWidth}
                    isRecurringTransactions={isRecurringTransactions}
                    sortBy={sortState.by}
                    sortDirection={sortState.direction}
                    onSortChange={onSortChange}
                />
            </thead>

            <tbody className="TransactionsTable-body">{tableRows}</tbody>
        </table>
    ) : (
        // We need a div wrapping the empty area so that it can get the className prop
        // so that scenes that conditionally hide the table also conditionally hide the empty area.
        //
        // Otherwise we end up with something like two empty areas on mobile.
        //
        // Also, we need the test ID on a container surrounding the empty area to mirror the
        // layout of the TransactionsList, so that we can test consistently.
        <div className={classNames("TransactionsTable", className)} data-testid={dataTestId}>
            <EmptyTransactionsArea isRecurringTransactions={isRecurringTransactions} />
        </div>
    );
};

export default TransactionsTable;
