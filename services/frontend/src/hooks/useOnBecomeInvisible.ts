import {useEffect} from "react";

/** A kind of lifecycle hook to trigger events when an element becomes invisible (i.e. 'not' visible). */
const useOnBecomeInvisible = (isVisible: boolean, callback: Function): void => {
    useEffect(() => {
        if (!isVisible) {
            callback();
        }
    }, [isVisible, callback]);
};

export default useOnBecomeInvisible;
