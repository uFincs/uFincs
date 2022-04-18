import {useEffect} from "react";
import enhanceKeyboardNavigation from "utils/enhanceKeyboardNavigation";

/** See `utils/enhanceKeyboardNavigation` for an explanation. */
const useEnhancedKeyboardNavigation = () => {
    useEffect(() => {
        return enhanceKeyboardNavigation();
    }, []);
};

export default useEnhancedKeyboardNavigation;
