import classNames from "classnames";
import {memo} from "react";
import {TextField} from "components/atoms";
import {ListItem} from "components/molecules";
import {useCurrencySymbol, useDateRangeAccount, useKeyboardNavigation} from "hooks/";
import {ValueFormatting} from "services/";
import {DefaultListItemActions, ListItemActions} from "utils/componentTypes";
import {Cents} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import "./AccountsListItem.scss";

interface AccountsListItemProps extends ConnectedProps {
    /** The raw balance of the account, in cents. */
    balance?: Cents;

    /** The name of the account. */
    name?: string;

    /** Handler for navigating to the first item in the list. Used for keyboard navigation. */
    onFirstItem: () => void;

    /** Handler for navigating to the last item in the list. Used for keyboard navigation. */
    onLastItem: () => void;

    /** Handler for navigating to the previous item in the list. Used for keyboard navigation. */
    onPreviousItem: () => void;

    /** Handler for navigating to the next item in the list. Used for keyboard navigation. */
    onNextItem: () => void;
}

interface PureAccountsListItemProps extends Omit<AccountsListItemProps, "id"> {
    /** The actions to show. Useful for hiding delete/edit during the onboarding process. */
    actionsToShow?: ListItemActions;

    /** The raw balance of the account, in cents. */
    balance: Cents;

    /** The name of the account. */
    name: string;
}

/** A list item for the Accounts list (mobile or desktop). */
const PureAccountsListItem = memo(
    ({
        className,
        actionsToShow = DefaultListItemActions,
        balance = 0,
        name = "",
        singleLayer = false,
        onFirstItem,
        onLastItem,
        onPreviousItem,
        onNextItem,
        ...otherProps
    }: PureAccountsListItemProps) => {
        const currencySymbol = useCurrencySymbol();

        const onKeyDown = useKeyboardNavigation({
            onFirst: onFirstItem,
            onLast: onLastItem,
            onPrevious: onPreviousItem,
            onNext: onNextItem
        });

        return (
            <ListItem
                className={classNames(
                    "AccountsListItem",
                    {"AccountsListItem-single-layer": singleLayer},
                    className
                )}
                aria-label={name}
                title={name}
                actionsToShow={actionsToShow}
                singleLayer={singleLayer}
                onKeyDown={onKeyDown}
                {...otherProps}
            >
                <div className="AccountsListItem-content" data-testid="accounts-list-item">
                    <TextField className="AccountsListItem-name">{name}</TextField>

                    <TextField className="AccountsListItem-balance">
                        {ValueFormatting.formatMoney(balance, {currencySymbol})}
                    </TextField>
                </div>
            </ListItem>
        );
    }
);

const AccountsListItem = ({balance, name, ...otherProps}: AccountsListItemProps) => {
    const dateRangeAccount = useDateRangeAccount(otherProps.id);

    // If the balance/name were passed through as props, then that means that `usePropData`
    // was set on the `AccountsList` and that we should use the prop values instead of the store values.
    const finalBalance = balance || dateRangeAccount.balance;
    const finalName = name || dateRangeAccount.name;

    return <PureAccountsListItem balance={finalBalance} name={finalName} {...otherProps} />;
};

export const PureComponent = PureAccountsListItem;
export const ConnectedAccountsListItem = connect(AccountsListItem);
export default ConnectedAccountsListItem;
