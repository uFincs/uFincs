import {useSelector} from "react-redux";
import {userSlice} from "store/";

/** Just a small wrapper hook around the 'no-account' selector. */
const useNoAccount = () => {
    return useSelector(userSlice.selectors.selectNoAccount);
};

export default useNoAccount;
