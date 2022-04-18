import classNames from "classnames";
import React, {useMemo} from "react";
import {PersonalFinance} from "assets/graphics";
import {ListSectionHeader, TextField} from "components/atoms";
import {AccountsListItem, EmptyArea} from "components/molecules";
import {Account, AccountData, AccountType} from "models/";
import {MathUtils} from "services/";
import {DefaultListItemActions, ListItemActions} from "utils/componentTypes";
import flatMap from "utils/flatMap";
import {generateAnimatedList, generateAnimationCalculator} from "utils/listAnimation";
import {Id} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import "./AccountsList.scss";

// A mapping of account types to header labels.
const typesToHeader = {
    [Account.ASSET]: "Assets",
    [Account.LIABILITY]: "Liabilities",
    [Account.INCOME]: "Income",
    [Account.EXPENSE]: "Expenses"
} as const;

interface AccountsListProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The accounts to display, grouped by type. */
    accountsByType: Record<AccountType, Array<AccountData>>;

    /** The actions to show. Useful for hiding delete/edit during the onboarding process. */
    actionsToShow?: ListItemActions;

    /** Whether or not to use the single layer or double layer list items. */
    singleLayer: boolean;

    /** Whether or not to use the data from the `accountsByType` prop instead of having the
     *  list items connect to the store to get the data.
     *
     *  This allows the list to be used in different contexts. It is, in essence, a hack since
     *  I don't want to implement an `accountSelector` prop like the `TransactionsList` has.
     *
     *  Note: This prop should not be used if the list is being used for editing accounts.
     *  Otherwise, performance could be bad. */
    usePropData?: boolean;
}

/** A list of accounts. Can come in two variants: double layer (for mobile) or
 *  single layer (for desktop). */
const AccountsList = React.memo(
    ({
        className,
        accountsByType,
        actionsToShow = DefaultListItemActions,
        singleLayer = false,
        usePropData = false,
        onAddAccount,
        navigateToAccount,
        ...otherProps
    }: AccountsListProps) => {
        const types = useMemo(
            () => Object.keys(accountsByType) as Array<AccountType>,
            [accountsByType]
        );

        const allAccounts = useMemo(
            () => flatMap(types, (type) => accountsByType[type]),
            [accountsByType, types]
        );

        const accountsExist = useMemo(() => allAccounts.length > 0, [allAccounts]);

        const listItems = useMemo(
            () =>
                generateAnimatedList((indexCalculator) =>
                    types.map((type) => (
                        <AccountsListSection
                            key={type}
                            accounts={accountsByType[type]}
                            actionsToShow={actionsToShow}
                            allAccounts={allAccounts}
                            // Use Math.max to set a lower bound on the number of elements being
                            // animated. When there are no accounts, the minimum is 2 because the
                            // elements that are rendered are the header and the empty message.
                            // Whereas normally it is however many accounts there are plus the
                            // header (hence, + 1).
                            animationIndex={indexCalculator(
                                Math.max(2, accountsByType[type].length + 1)
                            )}
                            singleLayer={singleLayer}
                            type={type}
                            usePropData={usePropData}
                            navigateToAccount={navigateToAccount}
                        />
                    ))
                ),
            [
                accountsByType,
                actionsToShow,
                singleLayer,
                usePropData,
                allAccounts,
                types,
                navigateToAccount
            ]
        );

        return (
            <div
                className={classNames(
                    "AccountsList",
                    {
                        "AccountsList-single-layer": singleLayer,
                        "AccountsList-double-layer": !singleLayer
                    },
                    className
                )}
                {...otherProps}
            >
                {accountsExist ? listItems : <EmptyAccountsList onClick={onAddAccount} />}
            </div>
        );
    }
);

export const PureComponent = AccountsList;
export default connect(AccountsList);

/* Other Components */

interface AccountsListSectionProps {
    /** The list of accounts to display. */
    accounts: Array<AccountData>;

    /** The actions to show. Useful for hiding delete/edit during the onboarding process. */
    actionsToShow?: ListItemActions;

    /** The complete set of (sorted) accounts. Used for determining how to navigate between
     *  accounts using keyboard navigation. */
    allAccounts: Array<AccountData>;

    /** The index to start the list item animations from. */
    animationIndex?: number;

    /** Whether or not to use the single layer or double layer list items. */
    singleLayer: boolean;

    /** The Account type for this group of accounts. */
    type: string;

    /** Whether or not to use the data from the `accountsByType` prop instead of having the
     *  list items connect to the store to get the data. */
    usePropData?: boolean;

    /** Allows navigating to an account by its ID, for the keyboard navigation. */
    navigateToAccount: (id: Id) => void;
}

/** A section of the accounts list. A section is composed of the type header and the
 *  corresponding account list items. */
const AccountsListSection = ({
    accounts = [],
    actionsToShow = DefaultListItemActions,
    allAccounts = [],
    animationIndex = 0,
    singleLayer = false,
    type = "",
    usePropData = false,
    navigateToAccount
}: AccountsListSectionProps) => {
    const animationCalculator = generateAnimationCalculator(animationIndex);

    const listItems = useMemo(
        () =>
            accounts.map(({id, name, openingBalance}, index) => {
                const onFirstItem = () => {
                    const firstId = allAccounts[0].id;
                    navigateToAccount(firstId);
                };

                const onLastItem = () => {
                    const lastId = allAccounts[allAccounts.length - 1].id;
                    navigateToAccount(lastId);
                };

                const onPreviousItem = () => {
                    const currentIndex = allAccounts.findIndex((account) => account.id === id);

                    const previousPosition = MathUtils.decrementWithWrapping(
                        currentIndex,
                        allAccounts.length
                    );

                    const previousId = allAccounts[previousPosition].id;
                    navigateToAccount(previousId);
                };

                const onNextItem = () => {
                    const currentIndex = allAccounts.findIndex((account) => account.id === id);

                    const nextPosition = MathUtils.incrementWithWrapping(
                        currentIndex,
                        allAccounts.length
                    );

                    const nextId = allAccounts[nextPosition].id;
                    navigateToAccount(nextId);
                };

                return (
                    <AccountsListItem
                        key={id}
                        id={id}
                        balance={usePropData ? openingBalance : undefined}
                        name={usePropData ? name : undefined}
                        style={animationCalculator(index + 1)}
                        actionsToShow={actionsToShow}
                        singleLayer={singleLayer}
                        onFirstItem={onFirstItem}
                        onLastItem={onLastItem}
                        onNextItem={onNextItem}
                        onPreviousItem={onPreviousItem}
                    />
                );
            }),
        [
            accounts,
            actionsToShow,
            allAccounts,
            singleLayer,
            usePropData,
            animationCalculator,
            navigateToAccount
        ]
    );

    return (
        <div className="AccountsListSection">
            <ListSectionHeader
                className="AccountsListSection-header"
                style={animationCalculator(0)}
            >
                {typesToHeader[type]}
            </ListSectionHeader>

            {accounts.length === 0 && <EmptySectionMessage style={animationCalculator(1)} />}

            {listItems}
        </div>
    );
};

/** The helpful message to show when there are no accounts. */
export const EmptyAccountsList = ({
    className,
    onClick
}: {
    className?: string;
    onClick: (e: React.MouseEvent) => void;
}) => (
    <EmptyArea
        className={classNames("EmptyAccountsList", className)}
        data-testid="accounts-list-empty"
        Graphic={PersonalFinance}
        title="Welp, no accounts here"
        message="Can't get much done if you don't have any accounts."
        subMessage="How about creating one now?"
        actionLabel="Add Account"
        onClick={onClick}
    />
);

/** The helpful message to show when there are no accounts _for a type section_. */
const EmptySectionMessage = (props: any) => (
    <TextField className="EmptySectionMessage" {...props}>
        No accounts here yet!
    </TextField>
);
