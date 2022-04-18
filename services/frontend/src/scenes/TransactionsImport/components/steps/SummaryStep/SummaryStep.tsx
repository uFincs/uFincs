import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {StepDescription} from "components/molecules";
import {CombinedTransactionsView, PaginationFooter} from "components/organisms";
import {useCurrencySymbol, PaginationUrlProvider} from "hooks/";
import {ValueFormatting} from "services/";
import {Cents} from "utils/types";
import {StepNavigationFooter} from "../..";
import connect, {ConnectedProps} from "./connect";
import "./SummaryStep.scss";

interface SummaryStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The fifth and final step of the Transactions Import process, the Summary step is where
 *  the user reviews the transactions that they're about to import. */
const SummaryStep = ({
    className,
    accountName,
    fileName,
    importProfileName,
    netBalanceChange,
    transactions,
    transactionSelector,
    transactionsSelector
}: SummaryStepProps) => (
    <>
        <div className={classNames("SummaryStep", className)}>
            <StepDescription title="How does this look to you?">
                <TextField>
                    Here&apos;s all of the changes that importing these transactions will have.
                </TextField>
            </StepDescription>

            <div className="SummaryStep-body-container">
                <div className="SummaryStep-body">
                    <h3>Summary</h3>

                    <SummaryStats
                        accountName={accountName}
                        fileName={fileName}
                        importProfileName={importProfileName}
                        netBalanceChange={netBalanceChange}
                        newTransactionsCount={transactions.length}
                    />

                    <h3>Transactions</h3>
                </div>

                <PaginationUrlProvider totalItems={transactions.length}>
                    <CombinedTransactionsView
                        actionsToShow={[]}
                        transactions={transactions}
                        transactionSelector={transactionSelector}
                        transactionsSelector={transactionsSelector}
                    />

                    <PaginationFooter className="SummaryStep-PaginationFooter" />
                </PaginationUrlProvider>
            </div>
        </div>

        <StepNavigationFooter />
    </>
);

export default connect(SummaryStep);

/* Other Components */

interface SummaryStatsProps {
    /** The name of the account being imported to. */
    accountName: string;

    /** The name of the file being imported from. */
    fileName: string;

    /** The name of the import profile being used for parsing the file. */
    importProfileName: string;

    /** The net change in the balance of the account. */
    netBalanceChange: Cents;

    /** The number of new transactions being imported. */
    newTransactionsCount: number;
}

const SummaryStats = ({
    accountName,
    fileName,
    importProfileName,
    netBalanceChange,
    newTransactionsCount
}: SummaryStatsProps) => {
    const currencySymbol = useCurrencySymbol();

    return (
        <div className="SummaryStats" data-testid="summary-step-stats">
            <div className="SummaryStats-stat-container">
                <p className="SummaryStats-stat-header">Account</p>
                <p className="SummaryStats-stat">{accountName}</p>
            </div>

            <div className="SummaryStats-stat-container">
                <p className="SummaryStats-stat-header">File</p>
                <p className="SummaryStats-stat">{fileName}</p>
            </div>

            <div className="SummaryStats-stat-container">
                <p className="SummaryStats-stat-header">Net Balance Change</p>

                <p
                    className={classNames("SummaryStats-stat", {
                        "SummaryStats-stat--positive": netBalanceChange >= 0,
                        "SummaryStats-stat--negative": netBalanceChange < 0
                    })}
                >
                    {ValueFormatting.formatMoney(netBalanceChange, {currencySymbol})}
                </p>
            </div>

            <div className="SummaryStats-stat-container">
                <p className="SummaryStats-stat-header">Import Profile</p>
                <p className="SummaryStats-stat">{importProfileName}</p>
            </div>

            <div className="SummaryStats-stat-container">
                <p className="SummaryStats-stat-header">New Transactions</p>
                <p className="SummaryStats-stat SummaryStats-stat-transactions">
                    {newTransactionsCount}
                </p>
            </div>
        </div>
    );
};
