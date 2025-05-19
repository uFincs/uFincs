import classNames from "classnames";
import {Fragment, useMemo} from "react";
import {AmountChange, CurrentAmount, Divider, FromAmount} from "components/atoms";
import {useDateRangeAccountSummaries} from "hooks/";
import {Account, AccountType} from "models/";
import {Cents} from "utils/types";
import "./AccountSummaries.scss";

interface AccountSummariesProps {
    /** Custom class name. */
    className?: string;
}

/** A summary of all the accounts, by type. Combines with the `DateRangePicker` to view
 *  different ranges of the account balances. */
const AccountSummaries = ({className}: AccountSummariesProps) => {
    const {currentBalances, fromBalances} = useDateRangeAccountSummaries();

    const accountSummaries = useMemo(
        () =>
            Account.ACCOUNT_TYPES.map((type) => (
                <Fragment key={type}>
                    <AccountSummary
                        currentBalance={currentBalances[type]}
                        fromBalance={fromBalances[type]}
                        type={type}
                    />
                    {type !== Account.EXPENSE && <Divider orientation="vertical" />}
                </Fragment>
            )),
        [currentBalances, fromBalances]
    );

    return (
        <div
            className={classNames("AccountSummaries", className)}
            data-testid="account-summaries"
            aria-label="Account Summaries"
        >
            {accountSummaries}
        </div>
    );
};

export default AccountSummaries;

/* Other Components  */

interface AccountSummaryProps {
    /** The current sum total of the accounts. */
    currentBalance: Cents;

    /** The previous sum total of the accounts. */
    fromBalance: Cents;

    /** The type of the account. */
    type: AccountType;
}

/** The individual summary for an account type. Displays the current balance sum,
 *  the previous balance sum, and the change (percentage and difference) between the two. */
const AccountSummary = ({currentBalance, fromBalance, type}: AccountSummaryProps) => (
    <div className="AccountSummary">
        <div className="AccountSummary-header">
            <p className="AccountSummary-type">{Account.PLURAL_TYPES[type]}</p>

            <AmountChange
                className="AccountSummary-AmountChange-desktop"
                lightShade={true}
                positiveIsBad={type === Account.LIABILITY || type === Account.EXPENSE}
                oldAmount={fromBalance}
                newAmount={currentBalance}
                showDifference={true}
            />
        </div>

        <div className="AccountSummary-amount-percent-wrapper">
            <CurrentAmount
                className="AccountSummary-CurrentAmount"
                amount={currentBalance}
                lightShade={true}
            />

            <AmountChange
                className="AccountSummary-AmountChange-mobile"
                lightShade={true}
                positiveIsBad={type === Account.LIABILITY || type === Account.EXPENSE}
                oldAmount={fromBalance}
                newAmount={currentBalance}
                showDifference={true}
            />
        </div>

        <FromAmount className="AccountSummary-FromAmount" amount={fromBalance} lightShade={true} />
    </div>
);
