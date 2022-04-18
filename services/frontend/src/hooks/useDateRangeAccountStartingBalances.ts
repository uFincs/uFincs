import {useSelector} from "react-redux";
import {shiftByOneInterval, DateRangeSize} from "hooks/useDateRange";
import {Account} from "models/";
import {DateService} from "services/";
import {crossSliceSelectors} from "store/";
import {Id} from "utils/types";
import {useDateRange} from "./useDateRange";

/** Calculates the starting balances (i.e. the 'starting' balance and the 'from' balance)
 *  for a single account.
 *
 *  The 'starting' balance is the balance used at the start of calculating an account's balance
 *  over a certain date range.
 *
 *  The 'from' balance is the balance right before a certain date range. It is used as the 'From'
 *  amount when calculating the change in an account's balance between two periods.
 *
 *  For assets and liabilities, the 'starting' and 'from' balances are the same (since they
 *  have accumulative balances).
 *
 *  However, for income and expense accounts, since their balances are _not_ accumulative,
 *  their 'starting' balance is always 0, whereas their 'from' balance is the sum of all
 *  their transactions in the previous date range. */
const useDateRangeAccountStartingBalances = (
    id: Id | undefined
): {fromBalance: number; startingBalance: number} => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    const previousIntervalState = {...state};
    shiftByOneInterval(previousIntervalState, "backward");

    // Since this hook is used in something like the Account Details scene, the ID can
    // be invalid and not match an account. As such, we have to handle a potentially undefined
    // account.
    const accountsById = useSelector(crossSliceSelectors.accounts.selectAccountsById);
    const account = accountsById?.[id as string] as Account | undefined;

    const isAssetOrLiability =
        account?.type === Account.ASSET || account?.type === Account.LIABILITY;

    // Get the account balance from the beginning of time till right before the current date range.
    // This is used as the 'From' balance for Asset and Liability accounts.
    const {balance: assetLiabilityBalance} = useSelector((storeState) =>
        crossSliceSelectors.accounts.selectAccountBetweenDates(
            storeState,
            "",
            DateService.convertToUTCString(DateService.subtractDays(state.startDate, 1)),
            id
        )
    );

    // Get the account balance in the previous date interval.
    // This is used as the 'From' balance for Income and Expense accounts.
    const {balance: incomeExpenseBalance} = useSelector((storeState) =>
        crossSliceSelectors.accounts.selectAccountBetweenDates(
            storeState,
            previousIntervalState.startDate,
            previousIntervalState.endDate,
            id
        )
    );

    if (!account) {
        return {
            fromBalance: 0,
            startingBalance: 0
        };
    }

    // Determine what the starting balance will be.
    //
    // The default of 0 is used for Income and Expense accounts, since their balances are
    // only calculated over date ranges (i.e. they have no opening balances).
    //
    // Whereas Asset and Liability accounts either start with their opening balance (for All Time)
    // or their balance leading up to the current date range.
    const startingBalance = isAllTime
        ? account.openingBalance
        : isAssetOrLiability
        ? assetLiabilityBalance
        : 0;

    // Determine what the 'From' balance is.
    //
    // When using the 'All Time' date range, we obviously start from the account's opening
    // balance, because where else would it start?
    //
    // Otherwise, it just depends on the account type. Assets and Liabilities need the balance
    // from the beginning of time till right before the current date range, whereas
    // Income and Expenses need the balance in the previous date range.
    const fromBalance = isAllTime
        ? account.openingBalance
        : isAssetOrLiability
        ? assetLiabilityBalance
        : incomeExpenseBalance;

    return {startingBalance, fromBalance};
};

export default useDateRangeAccountStartingBalances;
