import classNames from "classnames";
import React, {useMemo} from "react";
import {AccountsIcon, DownloadIcon, PlusIcon, TransactionsIcon} from "assets/icons";
import {Dropdown, ShadowButton} from "components/atoms";
import connect, {ConnectedProps} from "./connect";
import "./GlobalAddButton.scss";

const useGenerateItems = (
    onAccount: () => void,
    onImportTransactions: () => void,
    onTransaction: () => void
) =>
    useMemo(
        () => [
            {Icon: TransactionsIcon, label: "Transaction", onClick: onTransaction},
            {Icon: AccountsIcon, label: "Account", onClick: onAccount},
            {Icon: DownloadIcon, label: "Import Transactions", onClick: onImportTransactions}
        ],
        [onAccount, onImportTransactions, onTransaction]
    );

// Need to wrap the ShadowButton to specify its children.
const AddButton = React.forwardRef((props: any, ref: React.Ref<HTMLButtonElement>) => (
    <ShadowButton
        className="GlobalAddButton-button"
        title="Add Accounts and Transactions"
        ref={ref}
        {...props}
    >
        <PlusIcon />
        <span className="GlobalAddButton-button-text">Add</span>
    </ShadowButton>
));

interface GlobalAddButtonProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** Whether to use the small (mobile) or large (desktop) design. */
    variant?: "small" | "large";
}

/** The button that is displayed in the app's navigation for adding any of the app's primary
 *  types of data. */
const GlobalAddButton = ({
    className,
    variant,
    onAccount,
    onImportTransactions,
    onTransaction
}: GlobalAddButtonProps) => {
    const items = useGenerateItems(onAccount, onImportTransactions, onTransaction);

    return variant === "small" ? (
        <Dropdown
            className={classNames("GlobalAddButton", className)}
            TriggerButton={AddButton}
            items={items}
            alignment="top-center"
            data-testid="global-add-button-mobile"
        />
    ) : (
        <Dropdown
            className={classNames("GlobalAddButton", className)}
            TriggerButton={AddButton}
            items={items}
            alignment="right"
            data-testid="global-add-button-desktop"
        />
    );
};

export const PureComponent = GlobalAddButton;
export default connect(GlobalAddButton);
