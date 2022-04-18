import classNames from "classnames";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {DelayedRender} from "components/atoms";
import {TabBarWithSections, TransactionsSearchInput} from "components/molecules";
import {
    CombinedRecurringTransactionsView,
    CombinedTransactionsView,
    PaginationFooter,
    SceneHeaderWithDateRangePicker,
    TransactionsSummary,
    TransactionTypeFilters
} from "components/organisms";
import {
    useDateRangeTransactionsWithSearch,
    useFilterTransactionsByType,
    useIsLargeWidth,
    PaginationUrlProvider,
    TransactionsSearchProvider,
    TransactionTypesProvider
} from "hooks/";
import {RecurringTransactionData, TransactionData} from "models/";
import {recurringTransactionsSlice} from "store/";
import {useResetPaginationWhenDateChanges} from "./hooks";
import "./Transactions.scss";

enum TransactionTabs {
    current = 0,
    recurring = 1,
    summary = 2
}

interface TransactionsProps {
    /** The currently active tab. */
    activeTab: number;

    /** The recurring transactions to display. */
    recurringTransactions: Array<RecurringTransactionData>;

    /** The transactions to display. */
    transactions: Array<TransactionData>;

    /** Handler for setting the `activeTab`. */
    setActiveTab: (index: number) => void;
}

/** The Transactions scene. Shows the users transactions. */
const PureTransactions = ({
    activeTab,
    recurringTransactions,
    transactions,
    setActiveTab
}: TransactionsProps) => {
    useResetPaginationWhenDateChanges();

    return (
        <main className="Transactions">
            <SceneHeaderWithDateRangePicker className="Transactions-header" title="Transactions" />

            <TransactionsSearchInput containerClassName="Transactions-TransactionsSearchInput" />
            <TransactionTypeFilters className="Transactions-TransactionTypeFilters" />

            <DelayedRender>
                <TransactionsWithSummary
                    activeTab={activeTab}
                    transactions={transactions}
                    setActiveTab={setActiveTab}
                />

                {((activeTab === TransactionTabs.current && transactions.length > 0) ||
                    (activeTab === TransactionTabs.recurring &&
                        recurringTransactions.length > 0)) && <PaginationFooter />}
            </DelayedRender>
        </main>
    );
};

/** This is just a wrapper.
 *  Since we need to use the pagination hook in `PureTransactions`,
 *  the context provider has to be one level up. */
const Transactions = () => {
    const [activeTab, setActiveTab] = useState<TransactionTabs>(TransactionTabs.current);

    let transactions = useDateRangeTransactionsWithSearch();
    transactions = useFilterTransactionsByType(transactions);

    const recurringTransactions = useSelector(
        recurringTransactionsSlice.selectors.selectRecurringTransactionsList
    );

    return (
        <PaginationUrlProvider
            totalItems={
                activeTab === TransactionTabs.current
                    ? transactions.length
                    : recurringTransactions.length
            }
        >
            <PureTransactions
                activeTab={activeTab}
                recurringTransactions={recurringTransactions}
                transactions={transactions}
                setActiveTab={setActiveTab}
            />
        </PaginationUrlProvider>
    );
};

/** Just another wrapper.
 *  Since we need to use the date range and search hooks in `Transactions`,
 *  the context providers has to be one level up. */
const WrappedTransactions = () => (
    <TransactionsSearchProvider keepLatestDuplicateTransaction={false}>
        <TransactionTypesProvider>
            <Transactions />
        </TransactionTypesProvider>
    </TransactionsSearchProvider>
);

export const PureComponent = PureTransactions;
export default WrappedTransactions;

/* Other Components */

// This is the point below which the tabbed view is used for the `TransactionsWithSummary`.
// Why 1200? Because it just _felt_ right. And it makes it so that 1366x768 users get the full layout.
const TABBED_BREAKPOINT = 1200;

const TRANSACTION_TABS = [
    {
        label: "Current Period",
        labelId: "transactions-tab-transactions",
        smallLabel: "Current",
        controlsId: "transactions-section-transactions"
    },
    {
        label: "Recurring Templates",
        labelId: "transactions-tab-recurring-transactions",
        smallLabel: "Recurring",
        controlsId: "transactions-section-recurring-transactions"
    }
];

const ALL_TABS = [
    ...TRANSACTION_TABS,
    {
        label: "Summary",
        labelId: "transactions-tab-summary",
        controlsId: "transactions-section-summary"
    }
];

// We're just removing `recurringTransactions` here because it isn't (currently) used here.
interface TransactionsWithSummaryProps extends Omit<TransactionsProps, "recurringTransactions"> {}

/** Combines the `TransactionsSummary` view with the `CombinedTransactionsView` to create the
 *  almighty `TransactionsWithSummary`. */
const TransactionsWithSummary = ({
    activeTab,
    transactions,
    setActiveTab
}: TransactionsWithSummaryProps) => {
    const {isLargeWidth, containerRef} = useIsLargeWidth<HTMLDivElement>(TABBED_BREAKPOINT);

    return (
        <div
            className={classNames("TransactionsWithSummary", {
                "TransactionsWithSummary--large-width": isLargeWidth
            })}
            ref={containerRef}
        >
            {isLargeWidth ? (
                <>
                    <TabBarWithSections
                        className="Transactions-tabs"
                        data-testid="transactions-with-summary-tabs"
                        activeTab={activeTab}
                        tabs={TRANSACTION_TABS}
                        setActiveTab={setActiveTab}
                    >
                        <CombinedTransactionsView transactions={transactions} />
                        <CombinedRecurringTransactionsView />
                    </TabBarWithSections>

                    {transactions.length > 0 && <TransactionsSummary />}
                </>
            ) : (
                <TabBarWithSections
                    className="Transactions-tabs"
                    data-testid="transactions-with-summary-tabs"
                    activeTab={activeTab}
                    tabs={ALL_TABS}
                    setActiveTab={setActiveTab}
                >
                    <CombinedTransactionsView transactions={transactions} />
                    <CombinedRecurringTransactionsView />

                    <TransactionsSummary />
                </TabBarWithSections>
            )}
        </div>
    );
};
