import classNames from "classnames";
import {memo, useMemo} from "react";
import {Thinking} from "assets/graphics";
import {DeleteIcon, EditIcon} from "assets/icons";
import {BackButton, Button} from "components/atoms";
import {AccountBalanceChart} from "components/charts";
import {EmptyArea, ShowFutureToggle} from "components/molecules";
import {
    CombinedTransactionsView,
    DateRangePicker,
    PaginationFooter,
    TransactionTypeFilters
} from "components/organisms";
import {
    useDateRangeAccountStartingBalances,
    useDateRangeTransactions,
    useFilterTransactionsByType,
    PaginationUrlProvider,
    TransactionTypesProvider
} from "hooks/";
import {Account, AccountData, AccountType, Transaction} from "models/";
import {ValueFormatting} from "services/";
import connect, {ConnectedProps} from "./connect";
import "./AccountDetails.scss";

interface AccountDetailsProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The Account Details scene. Where are all the good account information is displayed,
 *  like current balance, balance over time, and transactions. */
const AccountDetails = memo(
    ({className, account, id, onBack, onDelete, onEdit}: AccountDetailsProps) =>
        !account ? (
            <InvalidAccount onGoBackToAccounts={onBack} />
        ) : (
            <TransactionTypesProvider>
                <div className={classNames("AccountDetails", className)}>
                    <AccountDetailsHeader
                        account={account}
                        onBack={onBack}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />

                    {/* This DateRangePicker replaces the one from the Accounts scene header,
                when the AccountDetails is its own standalone page. */}
                    <DateRangePicker className="AccountDetails-DateRangePicker" />

                    <AccountBalanceChart id={id} />

                    <AccountDetailsTransactions account={account} />
                </div>
            </TransactionTypesProvider>
        )
);

export const ConnectedAccountDetails = connect(AccountDetails);
export default ConnectedAccountDetails;

/* Other Components */

interface AccountDetailsHeaderNameProps extends Pick<ConnectedProps, "onBack"> {
    /** Name of the account. Alternatively, when used with the `InvalidAccount`,
     *  it can be used to show "Unknown Account". */
    name: string;

    /** The type of the account. Alternatively, it can be not provided to hide the field,
     *  so that the `InvalidAccount` doesn't have to show it. */
    type?: AccountType;
}

/** The left side of the complete AccountDetails header, which has the name, type, and
 *  back button (on certain viewport sizes).
 *
 *  This needs to be its own component so that it can be shared between `AccountDetailsHeader` and
 *  `InvalidAccount`. */
const AccountDetailsHeaderName = ({name, type, onBack}: AccountDetailsHeaderNameProps) => (
    <div className="AccountDetailsHeaderName">
        <BackButton
            className="AccountDetailsHeaderName-BackButton"
            data-testid="account-details-back-button"
            onClick={onBack}
        />

        <div className="AccountDetailsHeaderName-container">
            {type && (
                <p className="AccountDetailsHeaderName-type">
                    {ValueFormatting.capitalizeString(type)}
                </p>
            )}

            <h2 className="AccountDetailsHeaderName-name">{name}</h2>
        </div>
    </div>
);

interface AccountDetailsHeaderProps extends Pick<ConnectedProps, "onBack" | "onDelete" | "onEdit"> {
    /** The account with the name and type information.
     *
     *  Note: We're not picking the 'account' prop from ConnectedProps because that version
     *  can be undefined, which is handled by AccountDetails. */
    account: AccountData;
}

/** The header for the Account Details scene. Has the name/type of the account, along with
 *  buttons to edit/delete the account. */
const AccountDetailsHeader = ({account, onBack, onDelete, onEdit}: AccountDetailsHeaderProps) => (
    <div className="AccountDetailsHeader">
        <AccountDetailsHeaderName name={account.name} type={account.type} onBack={onBack} />

        <div className="AccountDetailsHeader-actions-container">
            <Button
                className="AccountDetailsHeader-action-button"
                data-testid="account-details-edit-action"
                title="Edit"
                variant="secondary"
                onClick={onEdit}
            >
                <EditIcon />
                <span className="AccountDetailsHeader-action-label">Edit</span>
            </Button>

            <Button
                className="AccountDetailsHeader-action-button"
                data-testid="account-details-delete-action"
                title="Delete"
                variant="secondary"
                onClick={onDelete}
            >
                <DeleteIcon />
                <span className="AccountDetailsHeader-action-label">Delete</span>
            </Button>

            <ShowFutureToggle />
        </div>
    </div>
);

interface AccountDetailsTransactionsProps {
    /** The account with the type and ID information. */
    account: AccountData;
}

/** The transactions section of the Account Details scene.
 *  Basically a mini Transactions scene. */
const AccountDetailsTransactions = memo(({account}: AccountDetailsTransactionsProps) => {
    const {startingBalance} = useDateRangeAccountStartingBalances(account.id);

    let transactions = useDateRangeTransactions();
    transactions = useFilterTransactionsByType(transactions);

    transactions = useMemo(
        () => Transaction.filterByAccountId(transactions, account.id),
        [account, transactions]
    );

    // eslint-disable-next-line
    transactions = useMemo(() => transactions, [JSON.stringify(transactions)]);

    const typesToShow = useMemo(
        () => Account.determineTransactionTypes(account.type),
        [account.type]
    );

    return (
        <PaginationUrlProvider totalItems={transactions.length}>
            <div className="AccountDetailsTransactions">
                <h3 className="AccountDetailsTransactions-title">Transactions</h3>

                <TransactionTypeFilters accountId={account.id} typesToShow={typesToShow} />

                {/* Need a container around the table/list and pagination so that the pagination
                doesn't get excess spacing from the grid gap. */}
                <div className="AccountDetailsTransactions-transactions-container">
                    <CombinedTransactionsView
                        account={account}
                        accountStartingBalance={startingBalance}
                        transactions={transactions}
                    />

                    {transactions.length > 0 && <PaginationFooter />}
                </div>
            </div>
        </PaginationUrlProvider>
    );
});

interface InvalidAccountProps {
    /** Handler to go back to the Accounts list. */
    onGoBackToAccounts: () => void;
}

/** The view to show when the user tries to view an 'invalid' account. That is, the ID in
 *  the URL doesn't resolve to any known account. */
const InvalidAccount = ({onGoBackToAccounts}: InvalidAccountProps) => (
    <div className="AccountDetails-InvalidAccount">
        <AccountDetailsHeaderName name="Unknown Account" onBack={onGoBackToAccounts} />

        <EmptyArea
            className="InvalidAccount-EmptyArea"
            Graphic={Thinking}
            title="This isn't an account?"
            message="Hmm, doesn't seem like there's an account here."
            subMessage="How about going back to your accounts list?"
            actionLabel="Go back to Accounts"
            onClick={onGoBackToAccounts}
        />
    </div>
);
