import {useCallback, useState} from "react";
import {useAccountOptions, useSelectableList} from "hooks/";
import {
    AccountData,
    AccountType,
    BulkEditableTransactionProperty,
    ImportableTransaction,
    Transaction
} from "models/";
import {Id} from "utils/types";

export type DialogType = "account" | "amount" | "date" | "description" | "type";
export type ActionType = DialogType | "exclude" | "include";

/** Hook for controlling the visibility of the current action dialog. */
const useActionDialog = () => {
    const [dialogThatIsOpen, setOpenDialog] = useState<DialogType | "">("");

    const onOpenDialog = (dialog: DialogType) => () => setOpenDialog(dialog);
    const onCloseDialog = () => setOpenDialog("");

    return {dialogThatIsOpen, onOpenDialog, onCloseDialog};
};

/** Hook for controlling when the actions should be enabled. */
const useEnableActions = (
    selectedTransactionIds: Array<Id>,
    transactionsById: Record<Id, Transaction>
) => {
    const enableActions = selectedTransactionIds.length > 0;

    const enableAccountAction =
        enableActions &&
        selectedTransactionIds.every(
            (id) => transactionsById[id].type === transactionsById[selectedTransactionIds[0]].type
        );

    return {enableActions, enableAccountAction};
};

/** Hook for generating the correct set of account suggestions for the Account input based
 *  on the type of the transactions being changed. */
const useAccountSuggestions = (
    selectedTransactionIds: Array<Id>,
    transactionsById: Record<Id, Transaction>,
    accountsByType: Record<AccountType, Array<AccountData>>
) => {
    // Note: We can afford to just take the first selected transaction because these suggestions
    // won't be used unless `enableAccountAction` is set, which is calculated separately.
    // However, we still have to set a default type in case there are no selected transactions.
    const type = transactionsById?.[selectedTransactionIds?.[0]]?.type || Transaction.INCOME;

    const {creditAccountTypes, debitAccountTypes} = Transaction.determineAccountTypes(type);
    const {targetAccount} = ImportableTransaction.determineTargetTransactionSides(type);

    const accountTypes = targetAccount === "credit" ? creditAccountTypes : debitAccountTypes;
    const accountSuggestions = useAccountOptions(accountTypes, accountsByType);

    const editableAccountProperty: BulkEditableTransactionProperty =
        Transaction.mapTransactionSideToAccount(targetAccount);

    return {accountSuggestions, editableAccountProperty};
};

/** Hook for wrapping the `onSubmit` handler to unselect all of the selected transactions after submit. */
const useUnselectTransactionsOnSubmit = (
    onSubmit: (ids: Array<Id>, property: BulkEditableTransactionProperty, value: string) => void
) => {
    const {dispatch} = useSelectableList();

    return useCallback(
        (ids: Array<Id>, property: BulkEditableTransactionProperty, value: string) => {
            onSubmit(ids, property, value);
            dispatch.unselectAllItems();
        },
        [dispatch, onSubmit]
    );
};

/** Primary hook for the `BulkTransactionActions`. */
export const useBulkTransactionActions = (
    transactionsById: Record<Id, Transaction>,
    accountsByType: Record<AccountType, Array<AccountData>>,
    onSubmit: (ids: Array<Id>, property: BulkEditableTransactionProperty, value: string) => void
) => {
    const {state: selectedTransactions} = useSelectableList();
    const selectedTransactionIds = Object.keys(selectedTransactions);

    const {dialogThatIsOpen, onOpenDialog, onCloseDialog} = useActionDialog();

    const {enableActions, enableAccountAction} = useEnableActions(
        selectedTransactionIds,
        transactionsById
    );

    const {accountSuggestions, editableAccountProperty} = useAccountSuggestions(
        selectedTransactionIds,
        transactionsById,
        accountsByType
    );

    const finalOnSubmit = useUnselectTransactionsOnSubmit(onSubmit);

    return {
        accountSuggestions,
        dialogThatIsOpen,
        editableAccountProperty,
        enableActions,
        enableAccountAction,
        selectedTransactionIds,
        onOpenDialog,
        onCloseDialog,
        finalOnSubmit
    };
};
