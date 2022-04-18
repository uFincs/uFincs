import {useSelector} from "react-redux";
import {Account} from "models/";
import {crossSliceSelectors} from "store/";
import {Id} from "utils/types";
import {useDateRange, DateRangeSize} from "./useDateRange";

/** Selects an account by ID with its balance calculated for the current date range. */
const useDateRangeAccount = (id: Id) => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    const accountsById = useSelector(crossSliceSelectors.accounts.selectAccountsById);
    const type = accountsById?.[id]?.type; // Use optional chaining since ID might not exist (yet).

    // When the account is an Asset or Liability, we want to query the balance from the beginning
    // of time till the end date, since their balances are accumulative.
    // However, we only want the balance between the dates when it's an Income or Expense
    // account, since their balances are non-accumulative.
    const startDate =
        isAllTime || type === Account.ASSET || type === Account.LIABILITY ? "" : state.startDate;

    const endDate = isAllTime ? "" : state.endDate;

    const account = useSelector((storeState) =>
        crossSliceSelectors.accounts.selectAccountBetweenDates(storeState, startDate, endDate, id)
    );

    return account;
};

export default useDateRangeAccount;
