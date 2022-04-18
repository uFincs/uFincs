import {useMemo} from "react";
import {
    useCurrencySymbol,
    useDateRange,
    useDateRangeAccountSummaries,
    useContainerWidth,
    useDateRangeTransactions
} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {Transaction, TransactionData} from "models/";
import {ChartService, DateService} from "services/";
import {Cents, UTCDateString, ChartDateInterval, DateAmountDataPoint} from "utils/types";

const useSelectTransactions = (): {
    incomeByDate: Record<UTCDateString, TransactionData>;
    expensesByDate: Record<UTCDateString, TransactionData>;
} => {
    // Get the transactions in the current interval.
    const transactions = useDateRangeTransactions();

    const {income, expenses} = useMemo(
        () => Transaction.splitIncomeAndExpenses(transactions),
        [transactions]
    );

    const incomeByDate = useMemo(() => Transaction.indexByDate(income), [income]);
    const expensesByDate = useMemo(() => Transaction.indexByDate(expenses), [expenses]);

    return {incomeByDate, expensesByDate};
};

export const useIncomeExpenseChartStyles = (
    incomeData: Array<DateAmountDataPoint>,
    expensesData: Array<DateAmountDataPoint>,
    dateInterval: ChartDateInterval
) => {
    const currencySymbol = useCurrencySymbol();

    const {
        state: {rangeSize}
    } = useDateRange();

    const {containerRef, width} = useContainerWidth(250);
    const xAxisTickAngle = ChartService.calculateTickLabelAngle(width);

    const incomeDomain = useMemo(() => ChartService.calculateMoneyDomain(incomeData), [incomeData]);

    const expensesDomain = useMemo(
        () => ChartService.calculateMoneyDomain(incomeData),
        [incomeData]
    );

    const domain: [Cents, Cents] = useMemo(
        () => (incomeDomain[1] > expensesDomain[1] ? [0, incomeDomain[1]] : [0, expensesDomain[1]]),
        [incomeDomain, expensesDomain]
    );

    const xAxisFormatter = useMemo(
        () => ChartService.formatDateLabels(dateInterval),
        [dateInterval]
    );

    const yAxisFormatter = useMemo(
        () => ChartService.formatMoneyLabels(domain, {currencySymbol}),
        [currencySymbol, domain]
    );

    // Need to cache bust on `data`, so that the tooltip gets busted whenever the data changes.
    // This is relevant since some (weekly) tooltips might get different start dates
    // depending on how many days there are, and we don't want old tooltips to show up for
    // new data.
    const incomeTooltipFormatter = useMemo(
        () => ChartService.formatMoneyTooltips(dateInterval, "Income: ", {currencySymbol}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currencySymbol, dateInterval, incomeData]
    );

    const expensesTooltipFormatter = useMemo(
        () => ChartService.formatMoneyTooltips(dateInterval, "Expenses: ", {currencySymbol}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currencySymbol, dateInterval, expensesData]
    );

    const domainPadding = calcDomainPadding(width, rangeSize);
    const barAlignment = calcBarAlignment(rangeSize);
    const barRatio = calcBarRatio(width, rangeSize);

    const yAxisPadding = useMemo(
        () => ChartService.calculateYAxisPadding([...incomeData, ...expensesData]),
        [incomeData, expensesData]
    );

    return {
        containerRef,
        width,
        xAxisTickAngle,
        xAxisFormatter,
        yAxisFormatter,
        incomeTooltipFormatter,
        expensesTooltipFormatter,
        domainPadding,
        barAlignment,
        barRatio,
        yAxisPadding
    };
};

export const useIncomeExpenseChartData = () => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    // Get the transactions.
    const {incomeByDate, expensesByDate} = useSelectTransactions();

    // Get the From balances for the stats.
    const {fromBalances} = useDateRangeAccountSummaries();
    const fromIncome = fromBalances.income;
    const fromExpenses = fromBalances.expense;

    // Setup the start and end dates for the data generation.
    let {startDate, endDate} = state;

    // When using all time, we use the first transaction as the start date
    // and the current date as the end date.
    if (isAllTime) {
        const incomeDate = (Object.keys(incomeByDate) as Array<UTCDateString>)[0];
        const expenseDate = (Object.keys(expensesByDate) as Array<UTCDateString>)[0];

        startDate =
            (incomeDate && expenseDate && DateService.isLessThan(incomeDate, expenseDate)
                ? incomeDate
                : expenseDate) ||
            // Need a default in case there aren't any transactions yet
            // (e.g. when the app first loads).
            ("1970-01-01" as UTCDateString);

        endDate = DateService.getTodayAsUTCString();
    }

    const incomeExpenseReducer = (amount: Cents, transaction: TransactionData): Cents =>
        amount + transaction.amount;

    // Generate the data points.
    const incomeData = useMemo(
        () =>
            ChartService.generateDateAmountData({
                amountReducer: incomeExpenseReducer,
                transactionsByDate: incomeByDate,
                startingBalance: 0,
                startDate,
                endDate,
                usesRunningBalances: false
            }),
        [incomeByDate, startDate, endDate]
    );

    const expensesData = useMemo(
        () =>
            ChartService.generateDateAmountData({
                amountReducer: incomeExpenseReducer,
                transactionsByDate: expensesByDate,
                startingBalance: 0,
                startDate,
                endDate,
                usesRunningBalances: false
            }),
        [expensesByDate, startDate, endDate]
    );

    const currentIncome = incomeData.reduce((acc, {amount}) => acc + amount, 0);
    const currentExpenses = expensesData.reduce((acc, {amount}) => acc + amount, 0);

    // Generate a description for the chart for accessibility purposes.
    const description = `A stacked bar chart showing income and expenses ${
        isAllTime ? "for all time" : `from ${state.startDate} to ${state.endDate}`
    }.`;

    return {
        incomeData,
        expensesData,
        dateInterval: ChartService.calculateDateInterval(startDate, endDate),
        description,
        currentIncome,
        currentExpenses,
        fromIncome,
        fromExpenses
    };
};

/* Helper Functions */

/** Calculate the domain padding (that is, the amount of padding to push the chart away from the
 *  left/right sides of the chart). Need this so that the bars don't overlap the y-axis, or go off
 *  the chart.
 *
 *  Apparently needing domain padding is just a thing with Victory bar charts. Even their own examples
 *  add domain padding. Like, they just overlap the y-axis by default. Why? /shrug */
const calcDomainPadding = (width: number, rangeSize: DateRangeSize) => {
    if (rangeSize === DateRangeSize.weekly) {
        if (width < 400) {
            // When the width is this low, combined with the bar ratio below, the bars are slim
            // enough that we can get away with just a bit of padding so that the bars don't
            // overlap the axis.
            return 10;
        } else if (width < 700) {
            // OK, now the bars are getting a little thicker, so we need a bit more padding to
            // prevent y-axis overlap.
            return 20;
        } else {
            // At this point, we can no longer rely on a constant amount of padding to ensure
            // prevention of the y-axis overlap. Now we need to derive it based on the width
            // of the chart itself. This can start adding up pretty fast (think about it,
            // 1200 width = 60 padding, but it's necessary because of how fat the bars can get.)
            return width / 20;
        }
    } else {
        // Only the weekly range needs custom widths; everything else has enough bars
        // that we can use a constant domain padding.
        return 25;
    }
};

/** Calculates which alignment (start/middle) to use for the bars.
 *
 *  The alignment determines where, relative to the data point (which, in most cases,
 *  can be thought to be the label in x-axis), the bars are placed.
 *
 *  So with the 'middle' alignment, the bar is centered over the data point.
 *  Whereas with the 'start' alignment, the left side of the bar starts at the data point.
 *
 *  The reason we need to calculate the bar alignment is because, for some _stupid_ reason,
 *  when we're using the weekly range size (i.e. there are few bars), the alignment of the bars
 *  relative to the x-axis labels is _way_ off. To the point where we need the 'start' alignment
 *  to get the bars visually centered over the labels. Every other range size is fine.
 *
 *  Note that using the 'start' alignment has the negative side-effect of causing the tooltips to no
 *  longer be centered over the bars, but I couldn't find a way to fix this properly (x offsets and whatnot
 *  weren't good enough considering the bar width is dynamic), so we're taking that as tradeoff vs
 *  not having the bars centered over the labels (which looks _much_ worse, IMO). */
const calcBarAlignment = (rangeSize: DateRangeSize): "start" | "middle" => {
    if (rangeSize === DateRangeSize.weekly) {
        return "start";
    } else {
        return "middle";
    }
};

/** Calculates the bar ratio (i.e. the ratio of bar width to space between the bars).
 *
 *  We need to a smaller ratio when using the weekly range size because there are fewer bars.
 *  Otherwise the bars get _comically_ large at larger screen sizes
 *  (since the bars scale to the width of the chart). */
const calcBarRatio = (width: number, rangeSize: DateRangeSize) => {
    if (rangeSize === DateRangeSize.weekly) {
        if (width < 600) {
            return 0.6;
        } else {
            return 0.3;
        }
    } else {
        return undefined;
    }
};
