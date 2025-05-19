import {useCallback} from "react";
import {useCurrencySymbol, useOnActiveKey, useKeyboardNavigation, useSelectableList} from "hooks/";
import {Transaction} from "models/";
import {ValueFormatting} from "services/";
import {Id} from "utils/types";
import {TransactionsTableRowProps} from "./TransactionsTableRow";

const nullCallback = () => {};

/** Helper function for focusing onto the next row. */
const focusNext = (index: number = 0) => {
    const nextRow: any = document.querySelector(`[data-index='${index + 1}']`);

    if (nextRow) {
        nextRow?.focus();
    } else {
        (document.querySelector("[data-index]") as any)?.focus();
    }
};

/** Helper function for focusing onto the previous row. */
const focusPrevious = (index: number = 0) => {
    const previousRow: any = document.querySelector(`[data-index='${index - 1}']`);

    if (previousRow) {
        previousRow?.focus();
    } else {
        const allRows: NodeListOf<any> = document.querySelectorAll("[data-index]");
        allRows[allRows.length - 1]?.focus();
    }
};

/** Hook for generating the handlers necessary for enabling up/down arrow
 *  key navigation between rows. */
const useFocusNavigation = (index: number = 0) => {
    const onFocusNext = useCallback(() => focusNext(index), [index]);
    const onFocusPrevious = useCallback(() => focusPrevious(index), [index]);

    const onFocusNav = useKeyboardNavigation({
        onNext: onFocusNext,
        onPrevious: onFocusPrevious,
        disableKeys: {home: true, end: true, left: true, right: true}
    });

    return onFocusNav;
};

/** Hook for handling the (optional) selectable state of the row. */
const useSelectableRow = (id: Id) => {
    const {state: selectableState, dispatch: selectableDispatch} = useSelectableList({
        disableErrorCheck: true
    });

    const selectable = selectableState !== undefined;
    const selected = (selectable && id in selectableState) || undefined;

    return {
        onSelectRow: selectableDispatch?.selectItem,
        onToggleRowSelection: selectableDispatch?.toggleItem,
        selectable,
        selected
    };
};

/** The primary hook for all of the `TransactionsTableRow` logic. */
export const useTransactionsTableRow = ({
    index,
    id,
    amount = 0,
    date = "",
    type = Transaction.INCOME,
    creditAccountName = "",
    debitAccountName = "",
    isVirtualTransaction = false,
    runningBalance,
    placeholderCreditAccountName,
    placeholderDebitAccountName,
    onClick
}: Omit<TransactionsTableRowProps, "description" | "onDelete" | "onEdit">) => {
    const currencySymbol = useCurrencySymbol();

    const formattedAmount = ValueFormatting.formatMoney(amount, {currencySymbol});
    const formattedDate = ValueFormatting.formatDate(date);

    const {leftAccount: fromAccount, rightAccount: toAccount} = Transaction.determineAccountFlow(
        type,
        creditAccountName,
        debitAccountName
    );

    const {leftAccount: targetFromAccount, rightAccount: targetToAccount} =
        Transaction.determineAccountFlow(
            type,
            placeholderCreditAccountName,
            placeholderDebitAccountName
        );

    const formattedRunningBalance =
        runningBalance !== undefined
            ? ValueFormatting.formatMoney(runningBalance, {currencySymbol})
            : "";

    const {onSelectRow, onToggleRowSelection, selectable, selected} = useSelectableRow(id);

    const onRowClick = isVirtualTransaction
        ? nullCallback
        : selectable
          ? () => onToggleRowSelection(id)
          : onClick;

    const onFocusNav = useFocusNavigation(index);
    const onClickWithKeyDown = useOnActiveKey(onRowClick);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            onFocusNav(e);

            if (!isVirtualTransaction) {
                onClickWithKeyDown(e);
            }
        },
        [isVirtualTransaction, onClickWithKeyDown, onFocusNav]
    );

    return {
        formattedAmount,
        formattedDate,
        fromAccount,
        toAccount,
        targetFromAccount,
        targetToAccount,
        formattedRunningBalance,
        selectable,
        selected,
        onKeyDown,
        onRowClick,
        onSelectRow
    };
};
