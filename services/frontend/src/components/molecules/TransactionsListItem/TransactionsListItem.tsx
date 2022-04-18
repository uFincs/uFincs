import classNames from "classnames";
import React from "react";
import {ArrowNarrowRightIcon} from "assets/icons";
import {TextField, TransactionTypeIcon} from "components/atoms";
import {ListItem} from "components/molecules";
import {useCurrencySymbol} from "hooks/";
import {Transaction} from "models/";
import {ValueFormatting} from "services/";
import {DefaultListItemActions} from "utils/componentTypes";
import connect, {ConnectedProps} from "./connect";
import {useTransactionsListItem} from "./hooks";
import "./TransactionsListItem.scss";

const nullCallback = () => {};

interface TransactionsListItemProps extends ConnectedProps {}

/** A list item for the Transactions list (mobile only). */
const TransactionsListItem = React.forwardRef(
    (
        {
            className,
            actionsToShow = DefaultListItemActions,
            id,
            amount = 0,
            description = "",
            disabled = false,
            hasError = false,
            isFutureTransaction = false,
            isVirtualTransaction = false,
            type = Transaction.INCOME,
            creditAccountName = "",
            debitAccountName = "",
            placeholderCreditAccountName,
            placeholderDebitAccountName,
            style,
            onClick,
            onDelete,
            onEdit
        }: TransactionsListItemProps,
        ref
    ) => {
        actionsToShow = isVirtualTransaction ? [] : actionsToShow;

        const currencySymbol = useCurrencySymbol();

        const {
            fromAccount,
            toAccount,
            targetFromAccount,
            targetToAccount,
            selectable,
            selected,
            onItemClick
        } = useTransactionsListItem({
            id,
            type,
            creditAccountName,
            debitAccountName,
            placeholderCreditAccountName,
            placeholderDebitAccountName,
            onClick
        });

        return (
            <ListItem
                className={classNames(
                    "TransactionsListItem",
                    {
                        "TransactionsListItem--disabled": disabled,
                        "TransactionsListItem--has-error": hasError,
                        "TransactionsListItem--future": isFutureTransaction,
                        "TransactionsListItem--selected": selected,
                        "TransactionsListItem--virtual": isVirtualTransaction
                    },
                    className
                )}
                style={style}
                data-testid="transactions-list-item"
                aria-invalid={hasError}
                aria-label={description}
                title={description}
                actionsToShow={actionsToShow}
                // Since this list item is only for mobile, we always want the double layer layout.
                singleLayer={false}
                ref={ref}
                onClick={isVirtualTransaction ? nullCallback : onItemClick}
                onDelete={onDelete}
                onEdit={onEdit}
            >
                <div className="TransactionsListItem-content">
                    <TransactionTypeIcon
                        className="TransactionsListItem-icon"
                        checkable={selectable}
                        checked={selected}
                        disabled={disabled}
                        type={type}
                        withBackground={true}
                        // Notice: No `onCheck` handler. See `onItemClick` for details.
                    />

                    <div className="TransactionsListItem-body">
                        <TextField className="TransactionsListItem-description">
                            {description}
                        </TextField>

                        <TransactionsListItemAccounts
                            fromAccount={fromAccount}
                            toAccount={toAccount}
                            targetFromAccount={targetFromAccount}
                            targetToAccount={targetToAccount}
                        />
                    </div>

                    <TextField
                        className={classNames(
                            "TransactionsListItem-amount",
                            `TransactionsListItem-amount--${type}`
                        )}
                    >
                        {ValueFormatting.formatMoney(amount, {currencySymbol})}
                    </TextField>
                </div>
            </ListItem>
        );
    }
);

export const PureComponent = TransactionsListItem;
export default connect(TransactionsListItem);

/* Other Components */

interface TransactionsListItemAccountsProps {
    /** The 'From' account name. */
    fromAccount?: string;

    /** The 'To' account name. */
    toAccount?: string;

    /** The placeholder target 'From' account. */
    targetFromAccount?: string;

    /** The placeholder target 'To' account. */
    targetToAccount?: string;
}

/** The combination of the two accounts to form the 'From' -> 'To' text. */
const TransactionsListItemAccounts = ({
    fromAccount,
    toAccount,
    targetFromAccount,
    targetToAccount
}: TransactionsListItemAccountsProps) => (
    <div className="TransactionsListItem-accounts">
        <TextField
            className={classNames("TransactionsListItem-accounts-name", {
                "TransactionsListItem-accounts-name--target":
                    targetFromAccount !== undefined && !fromAccount
            })}
        >
            {targetFromAccount !== undefined && !fromAccount ? targetFromAccount : fromAccount}
        </TextField>

        <ArrowNarrowRightIcon className="TransactionsListItem-accounts-arrow-icon" />

        <TextField
            className={classNames("TransactionsListItem-accounts-name", {
                "TransactionsListItem-accounts-name--target":
                    targetToAccount !== undefined && !toAccount
            })}
        >
            {targetToAccount !== undefined && !toAccount ? targetToAccount : toAccount}
        </TextField>
    </div>
);
