import classNames from "classnames";
import {useMemo} from "react";
import * as React from "react";
import {
    RadioGroup,
    TransactionTypeOptionIncome,
    TransactionTypeOptionExpense,
    TransactionTypeOptionDebt,
    TransactionTypeOptionTransfer
} from "components/molecules";
import {Transaction, TransactionType} from "models/";
import {arrayToObject} from "utils/helperFunctions";
import {transactionTypeOptions} from "values/transactionTypeOptions";
import "./TransactionTypePicker.scss";

const COMPONENT_MAP = {
    [Transaction.INCOME]: TransactionTypeOptionIncome,
    [Transaction.EXPENSE]: TransactionTypeOptionExpense,
    [Transaction.DEBT]: TransactionTypeOptionDebt,
    [Transaction.TRANSFER]: TransactionTypeOptionTransfer
};

const TRANSACTION_OPTIONS_MAP = arrayToObject(transactionTypeOptions, {
    processor: (option) => ({...option, Component: COMPONENT_MAP[option.value]}),
    property: "value"
});

interface TransactionTypePickerProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    /** ID must be provided for this component to work. */
    id: string;

    /** Whether or not to focus the active option after mounting. */
    autoFocus?: boolean;

    /** Whether or not to disable the picker. */
    disabled?: boolean;

    /** A plain text label for the `TransactionTypePicker`. */
    label?: string;

    /** A custom label component for the `TransactionTypePicker`. */
    LabelComponent?: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;

    /** A list of which types to show. */
    typesToShow?: Array<TransactionType>;

    /** The currently selected transaction type. */
    value: string;

    /** Callback for whenever the selected transaction type changes.
     *  Need to omit it from the interface because it has a different signature.
     *
     *  Note that it uses a string value instead of a `TransactionType` value; this is to preserve
     *  compatibility with external input libraries, like `react-hook-form`. */
    onChange: (type: string) => void;

    /** Key handler. Useful for doing things like adding a handler to submit a form on 'Enter'. */
    onKeyDown?: (e: React.KeyboardEvent<any>) => void;
}

/** A picker (i.e. radio group) for Transaction types. */
const TransactionTypePicker = ({
    className,
    typesToShow = Transaction.TRANSACTION_TYPES,
    ...otherProps
}: TransactionTypePickerProps) => {
    const transactionOptions = useMemo(
        () => typesToShow.map((type) => TRANSACTION_OPTIONS_MAP[type]),
        [typesToShow]
    );

    return (
        <RadioGroup
            className={classNames("TransactionTypePicker", className)}
            data-testid="transaction-type-picker"
            options={transactionOptions}
            {...otherProps}
        />
    );
};

export default TransactionTypePicker;
