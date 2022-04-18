import {useSelector} from "react-redux";
import {preferencesSlice} from "store/";

/** Just a small wrapper hook around the 'currency symbol' selector. */
const useCurrencySymbol = () => {
    return useSelector(preferencesSlice.selectors.selectCurrencySymbol);
};

export default useCurrencySymbol;
