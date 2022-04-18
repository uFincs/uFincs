import classNames from "classnames";
import React from "react";
import {AutocompleteInput} from "components/molecules";
import {LabelledInputProps} from "components/molecules/LabelledInput";
import {useTransactionsAutocompleteInput} from "./hooks";
import "./TransactionsAutocompleteInput.scss";

interface TransactionsAutocompleteInputProps extends LabelledInputProps {
    /** We're re-declaring `value` here so that it only accepts strings;
     *  not numbers or string arrays like a regular input. */
    value: string;

    /** Because we deal with options in change events, we need a separate handler from onChange.
     *
     *  In TransactionsAutocompleteInput case, which is different from AutocompleteInput's case,
     *  the calling component only cares about the label (i.e. the input's actual value)
     *  because the value (i.e. the transaction ID) is stored in the TransactionsSearchProvider's
     *  state. */
    onInputValueChange: (value: string) => void;
}

/** An input that provides the user with autocomplete suggestions for transactions
 *  based on the transactions' description. */
const TransactionsAutocompleteInput = React.forwardRef(
    (
        {
            className,
            label,
            value,
            onInputValueChange,
            ...otherProps
        }: TransactionsAutocompleteInputProps,
        ref: React.Ref<HTMLInputElement>
    ) => {
        const {suggestions, onChange} = useTransactionsAutocompleteInput(onInputValueChange);

        return (
            <AutocompleteInput
                className={classNames("TransactionsAutocompleteInput", className)}
                label={label}
                // Don't want to autofill the transactions input, because its suggestions are far more
                // dynamic than a normal AutocompleteInput which has (mostly) static suggestions.
                autofillSingleValue={false}
                value={value}
                suggestions={suggestions}
                onInputValueChange={onChange}
                ref={ref}
                {...otherProps}
            />
        );
    }
);

export default TransactionsAutocompleteInput;
