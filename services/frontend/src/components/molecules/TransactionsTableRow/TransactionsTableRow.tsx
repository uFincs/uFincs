import classNames from "classnames";
import React from "react";
import {TransactionTypeIcon} from "components/atoms";
import {TableRowActions, TableRowContainer} from "components/molecules";
import {Transaction} from "models/";
import {DefaultListItemActions} from "utils/componentTypes";
import {Cents} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import {useTransactionsTableRow} from "./hooks";
import "./TransactionsTableRow.scss";

export interface TransactionsTableRowProps extends ConnectedProps {
    /** Index of the row in the current page of the table; used for maintaining focus
     *  between page switches. */
    index?: number;

    /** Whether or not to use the 'large' layout. */
    isLargeWidth?: boolean;

    /** The (optional) running balance for this transaction.
     *
     *  Used when the table is in something like the Account Details scene to show the accounts
     *  balance after each transaction. */
    runningBalance?: Cents | undefined;

    /** Explicit style prop for the animation styles that are passed in from the table. */
    style?: React.CSSProperties;
}

/** A single row of the TransactionsTable. Has all of the columns of data, with a compressed
 *  view for when the table is used in constrained widths. */
const TransactionsTableRow = ({
    className,
    style,
    index,
    isLargeWidth = true,
    actionsToShow = DefaultListItemActions,
    id,
    amount = 0,
    date = "",
    description = "",
    disabled = false,
    hasError = false,
    isFutureTransaction = false,
    isRecurringTransaction = false,
    isVirtualTransaction = false,
    type = Transaction.INCOME,
    creditAccountName = "",
    debitAccountName = "",
    runningBalance,
    placeholderCreditAccountName,
    placeholderDebitAccountName,
    onClick,
    onDelete,
    onEdit
}: TransactionsTableRowProps) => {
    actionsToShow = isVirtualTransaction ? [] : actionsToShow;

    const {
        formattedAmount,
        formattedDate,
        fromAccount,
        toAccount,
        targetFromAccount,
        targetToAccount,
        formattedRunningBalance,
        selectable,
        selected,
        onRowClick,
        onSelectRow,
        onKeyDown
    } = useTransactionsTableRow({
        index,
        id,
        amount,
        date,
        type,
        creditAccountName,
        debitAccountName,
        isVirtualTransaction,
        runningBalance,
        placeholderCreditAccountName,
        placeholderDebitAccountName,
        onClick
    });

    return (
        <TableRowContainer
            className={classNames(
                "TransactionsTableRow",
                {
                    "TransactionsTableRow--disabled": disabled,
                    "TransactionsTableRow--has-error": hasError,
                    "TransactionsTableRow--future": isFutureTransaction,
                    "TransactionsTableRow--selected": selected,
                    "TransactionsTableRow--virtual": isVirtualTransaction
                },
                className
            )}
            data-testid="transactions-table-row"
            aria-invalid={hasError}
            index={index}
            style={style}
            title={
                // Since we don't show actions for virtual transactions, best to give the user
                // a little tooltip explaining why.
                isVirtualTransaction && actionsToShow.length === 0
                    ? "You can't modify scheduled transactions"
                    : ""
            }
            onClick={onRowClick}
            onKeyDown={onKeyDown}
        >
            <td className="TransactionsTableRow-type" title={type}>
                <TransactionTypeIcon
                    checkable={selectable}
                    checked={selected}
                    disabled={disabled}
                    type={type}
                    withBackground={true}
                    onCheck={(selected) => onSelectRow(id, selected)}
                />
            </td>

            <td
                className="TransactionsTableRow-date"
                title={
                    isVirtualTransaction
                        ? `${formattedDate} - scheduled by a recurring transaction`
                        : formattedDate
                }
            >
                {formattedDate}
            </td>

            <td className="TransactionsTableRow-description" title={description}>
                {description}
            </td>

            {/* Need to adjust the position of the cells to match the headers, otherwise the
            headers will be labelling the wrong cells. That is, this is for accessibility. */}
            {!isLargeWidth && (
                <AccountCells
                    fromAccount={fromAccount}
                    toAccount={toAccount}
                    targetFromAccount={targetFromAccount}
                    targetToAccount={targetToAccount}
                />
            )}

            <td
                className={classNames(
                    "TransactionsTableRow-amount",
                    `TransactionsTableRow-amount--${type}`
                )}
                title={formattedAmount}
            >
                <span className="TransactionsTableRow-number-wrapper">{formattedAmount}</span>
            </td>

            {isLargeWidth && (
                <AccountCells
                    fromAccount={fromAccount}
                    toAccount={toAccount}
                    targetFromAccount={targetFromAccount}
                    targetToAccount={targetToAccount}
                />
            )}

            {runningBalance !== undefined && (
                <td className="TransactionsTableRow-balance" title={formattedRunningBalance}>
                    <span className="TransactionsTableRow-number-wrapper">
                        {formattedRunningBalance}
                    </span>
                </td>
            )}

            <TableRowActions
                className="TransactionsTableRow-actions"
                actionsToShow={actionsToShow}
                deleteTestId="transactions-table-row-delete"
                deleteTooltip={
                    isRecurringTransaction ? "Delete (won't delete past transactions)" : "Delete"
                }
                editTestId="transactions-table-row-edit"
                onDelete={onDelete}
                onEdit={onEdit}
            />
        </TableRowContainer>
    );
};

export const PureComponent = TransactionsTableRow;
export default connect(TransactionsTableRow);

/* Other Components */

interface AccountCellsProps {
    /** The 'From' account name. */
    fromAccount: string;

    /** The 'To' account name. */
    toAccount: string;

    /** The placeholder target 'From' account. */
    targetFromAccount?: string;

    /** The placeholder target 'To' account. */
    targetToAccount?: string;
}

/** The combination of the two account cells for the 'From' and 'To' columns. */
const AccountCells = ({
    fromAccount,
    toAccount,
    targetFromAccount,
    targetToAccount
}: AccountCellsProps) => (
    <>
        <td
            className={classNames(
                "TransactionsTableRow-account",
                "TransactionsTableRow-account--from",
                {
                    "TransactionsTableRow-account--target":
                        targetFromAccount !== undefined && !fromAccount
                }
            )}
            title={fromAccount || targetFromAccount}
        >
            {/* We need a wrapper so that we can apply the clamp styles directly to the text.
                This way, in the compressed view, the 'right arrow' doesn't disappear when the
                From account text is really long.

                It's really only the From account that needs this wrapper,
                but might as well throw it on To for consistency. */}
            <span className="TransactionsTableRow-text">
                {targetFromAccount !== undefined && !fromAccount ? targetFromAccount : fromAccount}
            </span>
        </td>

        <td
            className={classNames(
                "TransactionsTableRow-account",
                "TransactionsTableRow-account--to",
                {
                    "TransactionsTableRow-account--target":
                        targetToAccount !== undefined && !toAccount
                }
            )}
            title={toAccount || targetToAccount}
        >
            <span className="TransactionsTableRow-text">
                {targetToAccount !== undefined && !toAccount ? targetToAccount : toAccount}
            </span>
        </td>
    </>
);
