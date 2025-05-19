import classNames from "classnames";
import {Wallet} from "assets/graphics";
import {EmptyArea} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./EmptyTransactionsArea.scss";

const textContent = {
    regular: {
        title: "Welp, no transactions here",
        message: "Doesn't look like you've made any transactions during this time period.",
        actionLabel: "Add Transaction"
    },
    recurring: {
        title: "Welp, no recurring transactions here",
        message: "Doesn't look like you've created any recurring transactions yet.",
        actionLabel: "Add Recurring Transaction"
    }
};

interface EmptyTransactionsAreaProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The transactions specific binding of an `EmptyArea`.
 *  Useful for transaction lists and tables to let users know they don't got nothing. */
const EmptyTransactionsArea = ({
    className,
    isRecurringTransactions = false,
    onAddTransaction
}: EmptyTransactionsAreaProps) => (
    <EmptyArea
        className={classNames(
            "EmptyTransactionsArea",
            {"EmptyTransactionsArea--recurring": isRecurringTransactions},
            className
        )}
        data-testid="transactions-list-empty"
        Graphic={Wallet}
        subMessage="How about creating one now?"
        onClick={onAddTransaction}
        {...(isRecurringTransactions ? textContent.recurring : textContent.regular)}
    />
);

export const PureComponent = EmptyTransactionsArea;
export const ConnectedEmptyTransactionsArea = connect(EmptyTransactionsArea);
export default ConnectedEmptyTransactionsArea;
