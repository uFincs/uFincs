import classNames from "classnames";
import React, {useCallback, useMemo} from "react";
import {AccountTypeOption} from "components/molecules";
import {useAccountTypes, useDateRangeAccountSummaries} from "hooks/";
import {Account, AccountType} from "models/";
import KeyCodes from "values/keyCodes";
import "./AccountTypeFilters.scss";

interface AccountTypeFiltersProps extends React.HTMLAttributes<HTMLDivElement> {}

/** A 'checkbox' of Account types for filtering a set of accounts for something like a list.
 *
 *  Also displays the current balances for each account type. */
const AccountTypeFilters = ({className, ...otherProps}: AccountTypeFiltersProps) => {
    const {
        state,
        dispatch: {toggleType}
    } = useAccountTypes();

    const {currentBalances} = useDateRangeAccountSummaries();

    const onKeyDown = useCallback(
        (type: AccountType) => (e: React.KeyboardEvent<any>) => {
            if (e.keyCode === KeyCodes.ENTER || e.keyCode === KeyCodes.SPACE) {
                e.preventDefault();
                toggleType(type);
            }
        },
        [toggleType]
    );

    const options = useMemo(
        () =>
            Account.ACCOUNT_TYPES.map((type) => (
                <AccountTypeOption
                    key={type}
                    aria-selected={state[type]}
                    role="option"
                    tabIndex={0}
                    active={state[type]}
                    balance={currentBalances[type]}
                    type={type}
                    onClick={() => toggleType(type)}
                    onKeyDown={onKeyDown(type)}
                />
            )),
        [state, currentBalances, toggleType, onKeyDown]
    );

    return (
        <div
            className={classNames("AccountTypeFilters", className)}
            data-testid="account-type-filters"
            aria-label="Account Type Filters"
            role="listbox"
            {...otherProps}
        >
            {options}
        </div>
    );
};

export default AccountTypeFilters;
