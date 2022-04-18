import {useSelector} from "react-redux";
import {crossSliceSelectors} from "store/";

/** Just a small wrapper hook around the 'is lifetime subscription' selector. */
const useLifetimeSubscription = () => {
    return useSelector(crossSliceSelectors.user.selectSubscriptionIsLifetime);
};

export default useLifetimeSubscription;
