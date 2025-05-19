import classNames from "classnames";
import {useCallback, useMemo} from "react";
import * as React from "react";
import {TransactionTypeOption} from "components/molecules";
import {useDateRangeTransactionAmountsByType, useTransactionTypes} from "hooks/";
import {Transaction, TransactionType} from "models/";
import {Cents, Id} from "utils/types";
import KeyCodes from "values/keyCodes";
import "./TransactionTypeFilters.scss";

interface WrappedTransactionTypeFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
    /** An account ID to filter the transactions by before aggregating them to calculate
     *  the balances by type. This is used, for example, by the Account Details scene. */
    accountId?: Id;

    /** A list of the types to show. Defaults to all Transaction types.
     *
     *  Used for showing only the types that are relevant to an account, on the Account Details
     *  page. */
    typesToShow?: Array<TransactionType>;
}

interface TransactionTypeFiltersProps extends WrappedTransactionTypeFiltersProps {
    currentAmounts: Record<TransactionType, Cents>;
    fromAmounts: Record<TransactionType, Cents>;
}

/** A 'checkbox' of Transaction types for filtering a set of transactions for something like
 *  a table or a list.
 *
 *  Also displays convenient stats about the transactions, like total amounts per type. */
const TransactionTypeFilters = React.memo(
    ({
        className,
        accountId: _accountId,
        currentAmounts,
        fromAmounts,
        typesToShow = Transaction.TRANSACTION_TYPES,
        ...otherProps
    }: TransactionTypeFiltersProps) => {
        const {
            state,
            dispatch: {toggleType}
        } = useTransactionTypes();

        const onKeyDown = useCallback(
            (type: TransactionType) => (e: React.KeyboardEvent<any>) => {
                if (e.keyCode === KeyCodes.ENTER || e.keyCode === KeyCodes.SPACE) {
                    e.preventDefault();
                    toggleType(type);
                }
            },
            [toggleType]
        );

        const options = useMemo(
            () =>
                typesToShow.map((type) => (
                    <TransactionTypeOption
                        key={type}
                        aria-selected={state[type]}
                        role="option"
                        tabIndex={0}
                        active={state[type]}
                        currentAmount={currentAmounts[type]}
                        fromAmount={fromAmounts[type]}
                        type={type}
                        onClick={() => toggleType(type)}
                        onKeyDown={onKeyDown(type)}
                    />
                )),
            [state, currentAmounts, fromAmounts, toggleType, typesToShow, onKeyDown]
        );

        return (
            <div
                className={classNames("TransactionTypeFilters", className)}
                data-testid="transaction-type-filters"
                aria-label="Transaction Type Filters"
                role="listbox"
                {...otherProps}
            >
                {options}
            </div>
        );
    }
);

const WrappedTransactionTypeFilters = ({
    accountId,
    ...otherProps
}: WrappedTransactionTypeFiltersProps) => {
    const {currentAmounts, fromAmounts} = useDateRangeTransactionAmountsByType(accountId);

    return (
        <TransactionTypeFilters
            accountId={accountId}
            currentAmounts={currentAmounts}
            fromAmounts={fromAmounts}
            {...otherProps}
        />
    );
};

export default WrappedTransactionTypeFilters;
