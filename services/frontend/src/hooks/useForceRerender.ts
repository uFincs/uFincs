import {useCallback, useState} from "react";

/** Hook that gives back a function to force a re-render.
 *  Why? Because sometimes you just need to hack things. */
const useForceRerender = () => {
    const [, setRerender] = useState({});
    const forceRerender = useCallback(() => setRerender({}), [setRerender]);

    return forceRerender;
};

export default useForceRerender;
