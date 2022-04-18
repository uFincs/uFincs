import classNames from "classnames";
import React from "react";
import {animated, config, useTransition} from "react-spring";
import {LinkButton, ListSectionHeader} from "components/atoms";
import {SelectableAccountsListItem} from "components/molecules";
import {Account, AccountData, AccountType, BulkEditableAccountProperty} from "models/";
import {ValueFormatting} from "services/";
import {Id} from "utils/types";
import "./SelectableAccountsList.scss";

const AnimatedSelectableAccountsListItem = animated(SelectableAccountsListItem);

interface SelectableAccountsListProps {
    /** Custom class name. */
    className?: string;

    /** The list of accounts to display. */
    accounts: Array<AccountData>;

    /** A map of which accounts are currently selected (and which aren't). */
    selectedAccounts: Record<Id, boolean>;

    /** The type of the accounts that are shown in this list. */
    type: AccountType;

    /** Handler for adding a new account of the above type. */
    onAddAccount: (type: AccountType) => void;

    /** Handler for when one of the accounts becomes selected/deselected. */
    onSelectAccount: (id: Id, selected: boolean) => void;

    /** Handler for when one of the account's values changes. */
    onValueChange: (
        type: AccountType,
        id: Id,
        property: BulkEditableAccountProperty,
        value: string
    ) => void;
}

/** A list of (selectable!) accounts. Used during the onboarding process. */
const SelectableAccountsList = ({
    className,
    accounts,
    selectedAccounts,
    type,
    onAddAccount,
    onSelectAccount,
    onValueChange
}: SelectableAccountsListProps) => {
    // Transition so that added accounts slide in from the left.
    const transition = useTransition(accounts, {
        keys: (account: AccountData) => account.id,
        from: {x: -100, opacity: 0},
        enter: {x: 0, opacity: 1},
        // Disable the initial transition, so that the list items don't transition on first render.
        initial: null,
        config: config.stiff
    });

    const listItems = transition((style, {id, name, openingBalance}) => (
        <AnimatedSelectableAccountsListItem
            key={id}
            style={style as any}
            id={id}
            initialName={name}
            initialOpeningBalance={openingBalance}
            selected={!!selectedAccounts[id]}
            type={type}
            onSelect={(selected) => onSelectAccount(id, selected)}
            onValueChange={(id, property, value) => onValueChange(type, id, property, value)}
        />
    ));

    const noBalance = !Account.hasOpeningBalanceAndInterest(type);

    return (
        <div className={classNames("SelectableAccountsList", {}, className)}>
            <div
                className={classNames("SelectableAccountsList-header", {
                    "SelectableAccountsList-header--no-balance": noBalance
                })}
            >
                <ListSectionHeader className="SelectableAccountsList-header-name">
                    Name
                </ListSectionHeader>

                {!noBalance ? (
                    <ListSectionHeader className="SelectableAccountsList-header-balance">
                        Opening Balance
                    </ListSectionHeader>
                ) : null}
            </div>

            {listItems}

            <div className="SelectableAccountsList-footer">
                <LinkButton
                    className="SelectableAccountsList-add-account-button"
                    onClick={() => onAddAccount(type)}
                >
                    + Add {ValueFormatting.capitalizeString(type)} Account
                </LinkButton>
            </div>
        </div>
    );
};

export default SelectableAccountsList;
