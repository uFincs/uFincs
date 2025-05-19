import classNames from "classnames";
import * as React from "react";
import {CurrentAmount, OptionCard} from "components/atoms";
import {OptionCardProps} from "components/atoms/OptionCard";
import {Account, AccountType} from "models/";
import {ValueFormatting} from "services/";
import {Cents} from "utils/types";
import "./AccountTypeOption.scss";

interface BaseAccountTypeOptionProps extends OptionCardProps {
    /** The (optional) total (current) balance of the type, for use when filtering accounts. */
    balance?: Cents;
}

interface AccountTypeOptionProps extends BaseAccountTypeOptionProps {
    /** The Account type for this option. */
    type: AccountType;
}

/** A custom 'radio button' that can be used in a radio group for picking an Account's type. */
const AccountTypeOption = React.forwardRef(
    (
        {className, active, balance, type, ...otherProps}: AccountTypeOptionProps,
        ref: React.Ref<HTMLDivElement>
    ) => (
        <OptionCard
            className={classNames(
                "AccountTypeOption",
                {"AccountTypeOption--with-balance": balance !== undefined},
                className
            )}
            ref={ref}
            active={active}
            {...otherProps}
        >
            <span className="AccountTypeOption-type">
                {balance !== undefined
                    ? Account.PLURAL_TYPES[type]
                    : ValueFormatting.capitalizeString(type)}
            </span>

            {balance !== undefined && <CurrentAmount amount={balance} lightShade={active} />}
        </OptionCard>
    )
);

export const AccountTypeOptionAsset = React.forwardRef(
    (props: BaseAccountTypeOptionProps, ref: React.Ref<HTMLDivElement>) => (
        <AccountTypeOption type={Account.ASSET} ref={ref} {...props} />
    )
);

export const AccountTypeOptionLiability = React.forwardRef(
    (props: BaseAccountTypeOptionProps, ref: React.Ref<HTMLDivElement>) => (
        <AccountTypeOption type={Account.LIABILITY} ref={ref} {...props} />
    )
);

export const AccountTypeOptionIncome = React.forwardRef(
    (props: BaseAccountTypeOptionProps, ref: React.Ref<HTMLDivElement>) => (
        <AccountTypeOption type={Account.INCOME} ref={ref} {...props} />
    )
);

export const AccountTypeOptionExpense = React.forwardRef(
    (props: BaseAccountTypeOptionProps, ref: React.Ref<HTMLDivElement>) => (
        <AccountTypeOption type={Account.EXPENSE} ref={ref} {...props} />
    )
);

export default AccountTypeOption;
