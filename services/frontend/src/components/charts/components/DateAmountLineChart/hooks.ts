import {useMemo} from "react";
import {useContainerWidth, useCurrencySymbol} from "hooks/";
import {ChartService} from "services/";
import {ChartDateInterval, DateAmountDataPoint} from "utils/types";

/** Encapsulates all the styles/formatters necessary for the Date/Amount line chart. */
const useDateAmountLineChart = (
    data: Array<DateAmountDataPoint>,
    dateInterval: ChartDateInterval
) => {
    const currencySymbol = useCurrencySymbol();

    const {containerRef, width} = useContainerWidth(250);
    const xAxisTickAngle = ChartService.calculateTickLabelAngle(width);

    const amountsDomain = useMemo(() => ChartService.calculateMoneyDomain(data), [data]);

    const xAxisFormatter = useMemo(
        () => ChartService.formatDateLabels(dateInterval),
        [dateInterval]
    );

    const yAxisFormatter = useMemo(
        () => ChartService.formatMoneyLabels(amountsDomain, {currencySymbol}),
        [amountsDomain, currencySymbol]
    );

    // Need to cache bust on `data`, so that the tooltip gets busted whenever the data changes.
    // This is relevant since some (weekly) tooltips might get different start dates
    // depending on how many days there are, and we don't want old tooltips to show up for
    // new data.
    const tooltipFormatter = useMemo(
        () => ChartService.formatMoneyTooltips(dateInterval, "", {currencySymbol}),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dateInterval, data]
    );

    const yAxisPadding = useMemo(() => ChartService.calculateYAxisPadding(data), [data]);

    const {currentData, futureData} = useMemo(
        () => ChartService.splitCurrentFutureData(data, dateInterval),
        [data, dateInterval]
    );

    return {
        amountsDomain,
        containerRef,
        currentData,
        futureData,
        tooltipFormatter,
        xAxisFormatter,
        xAxisTickAngle,
        yAxisFormatter,
        yAxisPadding,
        width
    };
};

export default useDateAmountLineChart;
