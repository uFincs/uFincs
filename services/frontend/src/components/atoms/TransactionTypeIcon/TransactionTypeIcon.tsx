import classNames from "classnames";
import {ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, CheckIcon, CreditCardIcon} from "assets/icons";
import {useOnActiveKey, useStopPropagationCallback} from "hooks/";
import {Transaction, TransactionType} from "models/";
import {ValueFormatting} from "services/";
import "./TransactionTypeIcon.scss";

const typeIconMap = {
    [Transaction.INCOME]: ArrowUpIcon,
    [Transaction.EXPENSE]: ArrowDownIcon,
    [Transaction.DEBT]: CreditCardIcon,
    [Transaction.TRANSFER]: ArrowRightIcon
};

interface TransactionTypeIconProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not this icon doubles as a checkbox.
     *  Need this separate from the `checked` prop so that we can properly configure
     *  the icon as a checkbox for accessibility purposes. */
    checkable?: boolean;

    /** Whether or not this icon is checked, while it is being used as a checkbox.
     *  The `checkable` prop must be set to `true` to use this prop. */
    checked?: boolean;

    /** Whether or not the icon should look 'disabled'. In practice, this means the colors
     *  should be replaced with greys and the contrast should be dropped.
     *
     *  Note, however, that disabling the the icon doesn't _actually_ disable it... that is,
     *  if it is checkable, it can still be checked. Why? Because 'disabled' is really just used
     *  for the import process' "exclude from import" functionality. And even when a transaction is
     *  excluded from import, it still needs to be selectable, so that we can apply the bulk
     *  actions to it. */
    disabled?: boolean;

    /** Whether or not the icons should use a lighter shade.
     *
     *  This is useful when displaying the icons on a dark background; using a lighter
     *  shade increases their contrast against the background. */
    lightShade?: boolean;

    /** The transaction type for the icon. */
    type: TransactionType;

    /** Whether or not to show the icon on a lightly colored background. */
    withBackground?: boolean;

    /** Handler for checking the icon when it is `checkable`. */
    onCheck?: (checked: boolean) => void;
}

/** A component that encapsulates all of the different transaction type icons.
 *
 *  Can also double as a checkbox, for cases where many transactions in a list or table need
 *  to be selectable. */
const TransactionTypeIcon = ({
    className,
    checkable = false,
    checked,
    disabled = false,
    lightShade = false,
    type,
    withBackground = false,
    onCheck
}: TransactionTypeIconProps) => {
    if (checked !== undefined && !checkable) {
        throw new Error(
            "Using TransactionTypeIcon's `checked` property requires `checkable` to be `true`. "
        );
    }

    const Icon = typeIconMap[type];
    const label = ValueFormatting.capitalizeString(type);

    const wrappedOnCheck = useStopPropagationCallback(() => {
        onCheck?.(!checked);
    });

    const onKeyDown = useOnActiveKey(wrappedOnCheck);

    return (
        <div
            className={classNames(
                "TransactionTypeIcon",
                `TransactionTypeIcon--${type}`,
                {
                    "TransactionTypeIcon--with-background": withBackground,
                    "TransactionTypeIcon--checkable": checkable,
                    "TransactionTypeIcon--disabled": disabled,
                    "TransactionTypeIcon--light-shade": lightShade
                },
                className
            )}
            aria-checked={checkable ? checked : undefined}
            aria-label={label}
            role={checkable ? "checkbox" : undefined}
            tabIndex={checkable ? 0 : undefined}
            title={label}
            onClick={checkable ? wrappedOnCheck : undefined}
            onKeyDown={onKeyDown}
        >
            {checkable ? (
                <div
                    className={classNames("TransactionTypeIcon-inner", {
                        "TransactionTypeIcon--checked": checked
                    })}
                >
                    <div
                        className={classNames(
                            "TransactionTypeIcon-front",
                            `TransactionTypeIcon--${type}`
                        )}
                    >
                        <Icon />
                    </div>

                    <div className="TransactionTypeIcon-back">
                        <CheckIcon />
                    </div>
                </div>
            ) : (
                <Icon />
            )}
        </div>
    );
};

export default TransactionTypeIcon;
