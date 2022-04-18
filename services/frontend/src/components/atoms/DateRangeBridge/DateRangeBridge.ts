import {useEffect} from "react";
import {useDateRange} from "hooks/";
import connect, {ConnectedProps} from "./connect";

interface DateRangeBridgeProps extends ConnectedProps {}

/** This whole component is kinda a hacky workaround to the poor initial design decision to have
 *  the date range state stored in Context instead of in Redux.
 *
 *  tl;dr we need to listen for date range changes to cache results when realizing recurring transactions
 *  into the `virtualTransactions` slice.
 *
 *  Basically, since the state is stored in Context, we don't have a usual method of listening
 *  (i.e. `take`ing) for actions in sagas. As such, this component literally just proxies over the
 *  date range Context state, emitting actions whenever the state changes, so that we can listen
 *  for the state changes in Redux land.
 *
 *  For a detailed explanation for how we arrived at the conclusion that we should even do this,
 *  review the second Design section of the UFC-202 design doc. */
const DateRangeBridge = ({recurringTransactions, onDateRangeChange}: DateRangeBridgeProps) => {
    const {state: dateState} = useDateRange();

    useEffect(() => {
        onDateRangeChange(dateState);

        // OK, you see this? This `recurringTransactions` thing right here? Now _that's_ a hack.
        // Basically, we need to trigger realization when a new recurring transaction is created or
        // when the recurring transactions are stored after being fetched, etc.
        //
        // Well, we _could_ do that by just listening for the corresponding actions.
        //
        // But there's one problem... We can't query the date range state from Redux; we can only push
        // the state to Redux. I mean, technically, we could start mirroring the context state into
        // Redux, but that seems even hackier!
        //
        // So... we just listen for changes to the `recurringTransactions` and trigger realizations
        // from here here. Yup, hacky.
    }, [dateState, recurringTransactions, onDateRangeChange]);

    return null;
};

export default connect(DateRangeBridge);
