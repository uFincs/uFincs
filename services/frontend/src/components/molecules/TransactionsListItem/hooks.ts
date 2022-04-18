import {useSelectableItem} from "hooks/";
import {Transaction, TransactionType} from "models/";
import {ConnectedProps} from "./connect";

/** Primary hook for the `TransactionsListItem`. */
export const useTransactionsListItem = ({
    id,
    type,
    creditAccountName,
    debitAccountName,
    placeholderCreditAccountName,
    placeholderDebitAccountName,
    onClick
}: Pick<
    ConnectedProps,
    | "id"
    | "type"
    | "creditAccountName"
    | "debitAccountName"
    | "placeholderCreditAccountName"
    | "placeholderDebitAccountName"
    | "onClick"
>) => {
    const {leftAccount: fromAccount, rightAccount: toAccount} = Transaction.determineAccountFlow(
        type as TransactionType,
        creditAccountName,
        debitAccountName
    );

    const {leftAccount: targetFromAccount, rightAccount: targetToAccount} =
        Transaction.determineAccountFlow(
            type as TransactionType,
            placeholderCreditAccountName,
            placeholderDebitAccountName
        );

    const {selectable, selected, onItemClick} = useSelectableItem(id, onClick);

    return {
        fromAccount,
        toAccount,
        targetFromAccount,
        targetToAccount,
        selectable,
        selected,
        onItemClick
    };
};
