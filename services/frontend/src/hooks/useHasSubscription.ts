import {useSelector} from "react-redux";
import {crossSliceSelectors} from "store/";

/** Just a small wrapper hook around the 'hasSubscription' selector. */
const useHasSubscription = () => {
    return useSelector(crossSliceSelectors.user.selectSubscriptionEnablesAppAccess);
};

export default useHasSubscription;
