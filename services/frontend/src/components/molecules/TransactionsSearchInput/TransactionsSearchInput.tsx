import classNames from "classnames";
import React, {useCallback, useMemo, useState} from "react";
import {SearchIcon} from "assets/icons";
import {Input} from "components/atoms";
import {InputProps} from "components/atoms/Input";
import {useTransactionsSearch} from "hooks/";
import debounce from "utils/debounce";
import "./TransactionsSearchInput.scss";

interface TransactionsSearchInputProps extends Omit<InputProps, "value" | "onChange"> {
    /** Custom class name. */
    className?: string;
}

/** An input that is used for searching for transactions. Used more for filtering a list
 *  by a given search query; use `TransactionsAutocompleteInput` if you need suggestion results. */
const TransactionsSearchInput = ({className, ...otherProps}: TransactionsSearchInputProps) => {
    // Store the input state internally instead of using the context 'query' state so that we don't
    // throttle the input value -- only the search callback.
    const [inputValue, setInputValue] = useState("");

    const {
        dispatch: {searchTransactions}
    } = useTransactionsSearch();

    // Need to throttle the search so that it doesn't fire on _every_ keystroke.
    // This way we optimize for the typing performance of the input (we don't want any lag).
    const onSearch = useMemo(() => debounce(searchTransactions), [searchTransactions]);

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
            onSearch(e.target.value);
        },
        [onSearch]
    );

    return (
        <Input
            className={classNames("TransactionsSearchInput", className)}
            aria-label="Search Transactions"
            data-testid="transactions-search-input"
            placeholder="Search descriptions"
            value={inputValue}
            onChange={onChange}
            RightIcon={SearchIcon}
            {...otherProps}
        />
    );
};

export default TransactionsSearchInput;
