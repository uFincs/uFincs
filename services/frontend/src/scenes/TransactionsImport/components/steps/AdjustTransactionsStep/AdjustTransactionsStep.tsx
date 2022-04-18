import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {BulkTransactionActions, StepDescription, WarningMessage} from "components/molecules";
import {ActiveImportRules, CombinedTransactionsView, PaginationFooter} from "components/organisms";
import {PaginationProvider, SelectableListProvider} from "hooks/";
import {StepNavigationFooter} from "../..";
import connect, {ConnectedProps} from "./connect";
import "./AdjustTransactionsStep.scss";

interface AdjustTransactionsStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The fourth step of the Transactions Import process, the Adjust Transactions step is where
 *  the user makes any adjustments to their detected transactions before importing them. */
const AdjustTransactionsStep = ({
    className,
    duplicateTransactions = [],
    duplicateTransactionsById = {},
    transactions = [],
    transactionsById = {},
    transactionSelector,
    transactionsSelector,
    onBulkEditTransactions,
    onEditTransaction
}: AdjustTransactionsStepProps) => (
    <>
        <div className={classNames("AdjustTransactionsStep", className)}>
            <StepDescription title="Do these transactions look right?">
                <TextField>
                    If there&apos;s <strong>any changes</strong> you need to make,
                    <br />
                    <strong>now&apos;s the time</strong> to do them.
                    <br /> <br />
                    If you want to <strong>exclude</strong> any transactions, just{" "}
                    <strong>select them</strong> and choose the{" "}
                    <strong>&quot;Exclude from Import&quot;</strong> action.
                </TextField>
            </StepDescription>

            <div className="AdjustTransactionsStep-body-container">
                <div className="AdjustTransactionsStep-body">
                    {transactions.length === 0 && duplicateTransactions.length === 0 ? (
                        <WarningMessage
                            className={"AdjustTransactionsStep-no-transactions-message"}
                        >
                            Looks we didn&apos;t find any transactions from your file.
                            <br /> <br />
                            Are you sure the import format was correct?
                        </WarningMessage>
                    ) : null}

                    {transactions.length > 0 || duplicateTransactions.length > 0 ? (
                        <ActiveImportRules />
                    ) : null}

                    {transactions.length > 0 && (
                        <SelectableListProvider>
                            <BulkTransactionActions
                                title="Transactions"
                                transactionsById={transactionsById}
                                onSubmit={onBulkEditTransactions}
                            />

                            <p className="AdjustTransactionsStep-target-account-disclaimer">
                                *These are placeholder names from your file. They must be replaced
                                with your uFincs accounts.
                            </p>

                            <PaginationProvider totalItems={transactions.length}>
                                <CombinedTransactionsView
                                    actionsToShow={["edit"]}
                                    transactions={transactions}
                                    transactionSelector={transactionSelector}
                                    transactionsSelector={transactionsSelector}
                                    onEditTransaction={onEditTransaction}
                                />

                                <PaginationFooter className="AdjustTransactionsStep-PaginationFooter" />
                            </PaginationProvider>
                        </SelectableListProvider>
                    )}

                    {duplicateTransactions.length > 0 && (
                        <>
                            <WarningMessage className="AdjustTransactionsStep-DuplicateTransactionsMessage">
                                <strong>
                                    Looks like we found {duplicateTransactions.length} duplicate
                                    transactions.
                                </strong>
                                <br /> <br />
                                They have been <strong>automatically excluded</strong> from being
                                imported.
                                <br /> <br />
                                If you want to <strong>include</strong> any of them, just select the
                                transactions and choose the{" "}
                                <strong>&quot;Include in Import&quot;</strong> action.
                            </WarningMessage>

                            <SelectableListProvider>
                                <BulkTransactionActions
                                    className="AdjustTransactionStep-BulkTransactionActions-duplicate"
                                    title="Duplicate Transactions"
                                    transactionsById={duplicateTransactionsById}
                                    onSubmit={onBulkEditTransactions}
                                />

                                <PaginationProvider totalItems={transactions.length}>
                                    <CombinedTransactionsView
                                        actionsToShow={["edit"]}
                                        transactions={duplicateTransactions}
                                        transactionSelector={transactionSelector}
                                        onEditTransaction={onEditTransaction}
                                    />

                                    <PaginationFooter className="AdjustTransactionsStep-PaginationFooter" />
                                </PaginationProvider>
                            </SelectableListProvider>
                        </>
                    )}
                </div>
            </div>
        </div>

        <StepNavigationFooter />
    </>
);

export default connect(AdjustTransactionsStep);
