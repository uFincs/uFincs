import {useCallback} from "react";
import {useSelector} from "react-redux";
import {TransactionData} from "models/";
import {crossSliceSelectors} from "store/";
import {useDateRange, DateRangeSize} from "./useDateRange";

/** Selects the transactions between the given date range (or the current date range if nothing custom is provided). */
const useDateRangeTransactions = ({
    customStartDate = "",
    customEndDate = ""
} = {}): Array<TransactionData> => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    // Due to operator precedence, need to group the ternary condition, otherwise it'll take precedence
    // over the OR even when customStart/EndDate are set.
    const startDate = customStartDate || (isAllTime ? "" : state.startDate);
    const endDate = customEndDate || (isAllTime ? "" : state.endDate);

    const selector = useCallback(
        (storeState) =>
            crossSliceSelectors.transactions.selectTransactionsBetweenDates(
                storeState,
                startDate,
                endDate
            ),
        [startDate, endDate]
    );

    return useSelector(selector);
};

export default useDateRangeTransactions;
