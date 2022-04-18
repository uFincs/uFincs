import classNames from "classnames";
import React, {useMemo} from "react";
import {ListSectionHeader} from "components/atoms";
import {EmptyTransactionsArea, TransactionsListItem} from "components/molecules";
import {useCalculateRunningBalances, useCurrencySymbol, useTransformTransactionsList} from "hooks/";
import {ValueFormatting} from "services/";
import {crossSliceSelectors, TransactionSelector} from "store/";
import {DefaultListItemActions, ListItemActions, TransactionViewProps} from "utils/componentTypes";
import {
    generateAnimatedList,
    generateAnimationCalculator,
    IndexCalculator
} from "utils/listAnimation";
import {Cents, Id} from "utils/types";
import "./TransactionsList.scss";

// This helper function is a bit overloaded in that it creates a function that generates
// the date headers as well as the deals with generating the animation styles (for the date header
// and the list item).
//
// Since it needs to do the animation calculations so that the date header can be animated,
// it totally only makes sense to also have it do it for the list item, right?
const generateDateHeaderGenerator = (indexCalculator: IndexCalculator) => {
    // Need to keep reference to the last date that was used; do this with a closure.
    let lastDate: string = "";

    return (date: string) => {
        let dateHeader = null;

        // Need to handle the animation calculations in this function so that we can
        // get the right animation styles onto the date header, as well as know the correct
        // offset for the list item.
        let animationIndex: number = 0;
        let animationCalculator = null;

        if (date !== lastDate) {
            lastDate = date;

            // 2 because it's the date header + list item.
            animationIndex = indexCalculator(2);
            animationCalculator = generateAnimationCalculator(animationIndex);

            dateHeader = (
                <ListSectionHeader
                    key={date}
                    className="TransactionsList-date-header"
                    style={animationCalculator(0)}
                >
                    {ValueFormatting.formatDate(date)}
                </ListSectionHeader>
            );
        } else {
            // 1 because it's only list item.
            animationIndex = indexCalculator(1);
            animationCalculator = generateAnimationCalculator(animationIndex);
        }

        return {
            dateHeader,

            // If we have a date header, then the transaction is the 'second' item.
            transactionStyles: animationCalculator(dateHeader ? 1 : 0)
        };
    };
};

// Generates the list of (animated) items that are to be displayed.
// Should be passed to `generateAnimatedList`.
const generateListItems =
    ({
        dates,
        ids,
        runningBalances,
        actionsToShow,
        transactionSelector,
        onDeleteTransaction,
        onEditTransaction
    }: {
        dates: Array<string>;
        ids: Array<Id>;
        runningBalances: Record<Id, Cents>;
        actionsToShow: ListItemActions;
        transactionSelector?: TransactionSelector;
        onDeleteTransaction?: (id: Id) => void;
        onEditTransaction?: (id: Id) => void;
    }) =>
    (indexCalculator: IndexCalculator) => {
        const generateDateHeader = generateDateHeaderGenerator(indexCalculator);

        const hasRunningBalances = Object.keys(runningBalances).length !== 0;

        // It might seem strange that we're generating a 2D array to get a flat list of items
        // for React to render, but _that is_ how React renders it.
        const listItems: Array<Array<JSX.Element | null>> = [];

        // OK, this is kinda confusing. So, the transactions (i.e. the IDs) are sorted date descending.
        // This means the latest transactions show up first in the list.
        //
        // However, we display the running balance after the 'last' transaction in a date block.
        //
        // However, the 'last' transaction is actually the first transaction _of the day_.
        //
        // But the 'end-of-day' balance is the 'running balance' of the last transaction of the day,
        // which is the visual 'first' transaction of the day.
        //
        // As such, `firstTransactionOfDate` refers to the _visual_ 'first' transaction, which is
        // really the last transaction of the day.
        let firstTransactionOfDate = "";

        // Need a reference to the last date, so that we can know when to change the
        // `firstTransactionOfDate`.
        let lastDate = "";

        for (let i = 0; i < ids.length; i++) {
            const date = dates[i];
            const id = ids[i];

            const {dateHeader, transactionStyles} = generateDateHeader(date);

            let endOfDayBalance = null;

            // Save the running balance of the visually first transaction so that we can display
            // it as the End of Day Balance after the visually last transaction of the date block.
            if (date !== lastDate) {
                firstTransactionOfDate = id;
                lastDate = date;
            }

            // When it's the last ID (period) or the last ID of the current date block,
            // need to append on an End of Day Balance, if running balances is enabled.
            if ((i === ids.length - 1 || date !== dates[i + 1]) && hasRunningBalances) {
                const animationIndex = indexCalculator(1);
                const animationCalculator = generateAnimationCalculator(animationIndex);

                endOfDayBalance = (
                    <EndOfDayBalance
                        key={`${id}-${runningBalances[firstTransactionOfDate]}`}
                        balance={runningBalances[firstTransactionOfDate]}
                        style={animationCalculator(0)}
                    />
                );
            }

            // As opposed to the AccountsList, where we have a separate AccountsListSection
            // component, we are just generating everything flat here using an array.
            //
            // We do this because the dates are dynamic; the AccountsList has the advantage
            // of knowing ahead of time that there are only so many types to generate
            // sections for.
            listItems.push([
                dateHeader,
                <TransactionsListItem
                    key={id}
                    id={id}
                    style={transactionStyles}
                    actionsToShow={actionsToShow}
                    transactionSelector={transactionSelector}
                    customOnDelete={onDeleteTransaction ? () => onDeleteTransaction(id) : undefined}
                    customOnEdit={onEditTransaction ? () => onEditTransaction(id) : undefined}
                />,
                endOfDayBalance
            ]);
        }

        return listItems;
    };

interface TransactionsListProps extends TransactionViewProps {}

/** A list of transactions. Used on sufficiently small screens, whereas the `TransactionsTable`
 *  is used on larger displays. */
const TransactionsList = ({
    className,
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
}: TransactionsListProps) => {
    const {ids, filteredTransactions} = useTransformTransactionsList(
        transactions,
        transactionsSelector
    );

    const runningBalances = useCalculateRunningBalances(
        transactions,
        account,
        accountStartingBalance
    );

    const transactionsExist = ids.length > 0;
    const dates = useMemo(() => filteredTransactions.map(({date}) => date), [filteredTransactions]);

    const listItems = useMemo(
        () =>
            generateAnimatedList(
                generateListItems({
                    dates,
                    ids,
                    runningBalances,
                    actionsToShow,
                    transactionSelector,
                    onDeleteTransaction,
                    onEditTransaction
                })
            ),
        // We're leveraging Option 3 from here:
        // https://lifesaver.codes/answer/usecallback-useeffect-support-custom-comparator
        // so that it memoizes the IDs and dates correctly.
        // Basically, it's a performance hack.
        // And we want to memoize on dates and IDs directly (instead of, say, filteredTransactions),
        // so that all of the rows aren't re-rendered whenever a transaction's data changes.
        // Again, performance hacking.
        // eslint-disable-next-line
        [JSON.stringify(dates), JSON.stringify(ids), JSON.stringify(runningBalances)]
    );

    return (
        <div className={classNames("TransactionsList", className)} {...otherProps}>
            {transactionsExist ? (
                listItems
            ) : (
                <EmptyTransactionsArea isRecurringTransactions={isRecurringTransactions} />
            )}
        </div>
    );
};

export default TransactionsList;

/* Other Components */

interface EndOfDayBalanceProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The balance for the end of this day. */
    balance: Cents;
}

/** The row for displaying the end-of-day balance after a date block. */
const EndOfDayBalance = ({balance, ...otherProps}: EndOfDayBalanceProps) => {
    const currencySymbol = useCurrencySymbol();

    return (
        <div className="EndOfDayBalance" {...otherProps}>
            <span>End of day balance</span>
            <span>{ValueFormatting.formatMoney(balance, {currencySymbol})}</span>
        </div>
    );
};
