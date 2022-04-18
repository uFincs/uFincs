import classNames from "classnames";
import React from "react";
import {ChartContainer, ChartStats, DateAmountLineChart} from "components/charts/components";
import {AccountData, AccountType} from "models/";
// TODO: Uncomment once we bring back Account interest.
// import {Account, AccountData, AccountType} from "models/";
// import {ValueFormatting} from "services/";
import {Cents, ChartDateInterval, DateAmountDataPoint, Id, Millipercents} from "utils/types";
import {useAccountBalanceChart} from "./hooks";
import "./AccountBalanceChart.scss";

interface WrappedAccountBalanceChartProps {
    /** Custom class name. */
    className?: string;

    /** The ID of the account. Since it comes from a URL param, it can be undefined.
     *  As such, need to handle the chart having no data. */
    id: Id | undefined;
}

interface AccountBalanceChartProps extends Omit<WrappedAccountBalanceChartProps, "id"> {
    /** The full account object. Since the ID can be undefined, so can the account.
     *  Used to display the stats like interest. */
    account: AccountData | undefined;

    /** The data for the chart. */
    data: Array<DateAmountDataPoint>;

    /** What interval was used for generating the chart data. */
    dateInterval: ChartDateInterval;

    /** A description of the chart for accessibility purposes. */
    description: string;

    /** The 'From' balance, used in the stats.
     *  Note that the 'Current' balance is derived from the last data point in the chart data. */
    fromBalance: Cents;
}

/** The chart to display an account's balance, along with some account stats like
 *  current balance and interest. */
const AccountBalanceChart = React.memo(
    ({
        className,
        account,
        data,
        dateInterval,
        description,
        fromBalance
    }: AccountBalanceChartProps) => {
        // Need to optionally access here to account for an edge case that came up in e2e testing.
        const currentAmount = data[data.length - 1]?.amount;

        return !account ? null : (
            <ChartContainer
                className={classNames("AccountBalanceChart", className)}
                data-testid="account-balance-chart"
            >
                <AccountStats
                    currentBalance={currentAmount}
                    fromBalance={fromBalance}
                    interest={account.interest}
                    type={account.type}
                />

                <DateAmountLineChart
                    data={data}
                    dateInterval={dateInterval}
                    description={description}
                    title={`Balance of ${account.name} over Time`}
                />
            </ChartContainer>
        );
    }
);

/** Want to keep a pure version (above) of the chart for stories. This wraps the chart
 *  to connect it to the store and date range context to get the data. */
const WrappedAccountBalanceChart = ({id, ...otherProps}: WrappedAccountBalanceChartProps) => {
    const {account, data, dateInterval, description, fromBalance} = useAccountBalanceChart(id);

    return (
        <AccountBalanceChart
            account={account}
            data={data}
            dateInterval={dateInterval}
            description={description}
            fromBalance={fromBalance}
            {...otherProps}
        />
    );
};

export const PureComponent = AccountBalanceChart;
export default WrappedAccountBalanceChart;

/* Other Components */

interface AccountStatsProps {
    /** The balance of the account at the end of the current date range. */
    currentBalance: Cents;

    /** The balance of the account either from the previous date range interval
     *  (for Income and Expense accounts) or from the beginning time right till the start of
     *  the current date range (for Asset and Liability accounts). */
    fromBalance: Cents;

    /** The user-set interest rate of the account. Only used for Asset and Liability accounts;
     *  not shown for Income and Expense accounts. */
    interest: Millipercents;

    /** The type of the account. */
    type: AccountType;
}

/** These are just some stats to show above the chart. Primarily account balances. */
const AccountStats = ({currentBalance, fromBalance, interest, type}: AccountStatsProps) => (
    <div className="AccountStats">
        <ChartStats currentAmount={currentBalance} fromAmount={fromBalance} title="Balance" />

        {/* TODO: Uncomment once we bring back Account interest. */}
        {/* {Account.hasOpeningBalanceAndInterest(type) ? (
            <div className="AccountStats-interest-container">
                <h2>Interest</h2>
                <p className="AccountStats-interest">{ValueFormatting.formatPercent(interest)}</p>
            </div>
        ) : null} */}
    </div>
);
