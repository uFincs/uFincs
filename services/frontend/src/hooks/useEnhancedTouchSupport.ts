import {useEffect} from "react";
import enhanceTouchSupport from "utils/enhanceTouchSupport";

/** See `utils/enhanceTouchSupport` for an explanation. */
const useEnhancedTouchSupport = () => {
    useEffect(() => {
        enhanceTouchSupport();
    }, []);
};

export default useEnhancedTouchSupport;
