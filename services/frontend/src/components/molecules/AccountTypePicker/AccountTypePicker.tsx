import classNames from "classnames";
import {useMemo} from "react";
import {
    AccountTypeOptionAsset,
    AccountTypeOptionExpense,
    AccountTypeOptionIncome,
    AccountTypeOptionLiability,
    RadioGroup
} from "components/molecules";
import {Account, AccountType} from "models/";
import {ValueFormatting} from "services/";
import "./AccountTypePicker.scss";

const ACCOUNT_OPTIONS_MAP = {
    [Account.ASSET]: {
        label: ValueFormatting.capitalizeString(Account.ASSET),
        value: Account.ASSET,
        Component: AccountTypeOptionAsset
    },
    [Account.LIABILITY]: {
        label: ValueFormatting.capitalizeString(Account.LIABILITY),
        value: Account.LIABILITY,
        Component: AccountTypeOptionLiability
    },
    [Account.INCOME]: {
        label: ValueFormatting.capitalizeString(Account.INCOME),
        value: Account.INCOME,
        Component: AccountTypeOptionIncome
    },
    [Account.EXPENSE]: {
        label: ValueFormatting.capitalizeString(Account.EXPENSE),
        value: Account.EXPENSE,
        Component: AccountTypeOptionExpense
    }
} as const;

interface AccountTypePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    /** Custom class name for the container. */
    containerClassName?: string;

    /** ID must be provided for this component to work. */
    id: string;

    /** Whether or not to focus the active option after mounting. */
    autoFocus?: boolean;

    /** Whether or not to disable the picker. */
    disabled?: boolean;

    /** A plain text label for the `AccountTypePicker`. */
    label?: string;

    /** A custom label component for the `AccountTypePicker`. */
    LabelComponent?: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;

    /** A list of which types to show.
     *
     *  Useful, for example, when we only want to show Asset and Liability (i.e. the import process). */
    typesToShow?: Array<AccountType>;

    /** The currently selected account type. */
    value: string;

    /** Callback for whenever the selected account type changes.
     *  Need to omit it from the interface because it has a different signature. */
    onChange: (type: string) => void;
}

/** A picker (i.e. radio group) for Account types. */
const AccountTypePicker = ({
    className,
    containerClassName,
    id,
    disabled,
    typesToShow = Account.ACCOUNT_TYPES,
    value,
    onChange,
    ...otherProps
}: AccountTypePickerProps) => {
    const accountOptions = useMemo(
        () => typesToShow.map((type) => ACCOUNT_OPTIONS_MAP[type]),
        [typesToShow]
    );

    return (
        <RadioGroup
            className={classNames("AccountTypePicker", className)}
            containerClassName={classNames("AccountTypePicker-container", containerClassName)}
            id={id}
            data-testid="account-type-picker"
            disabled={disabled}
            options={accountOptions}
            value={value}
            onChange={onChange}
            {...otherProps}
        />
    );
};

export default AccountTypePicker;
