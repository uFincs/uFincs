import {useRef} from "react";
import {to as interpolate, useSpring} from "react-spring";
import {useDrag} from "react-use-gesture";

// This value is in px. It was originally picked for toasts, so adjust the `swipeDistance` as necessary.
const DEFAULT_SWIPE_DISTANCE = 100;

/** Hook for enabling a component to be swipeable and to trigger a 'close' callback
 *  when the component has been swiped far enough (past the `swipeDistance`). */
const useSwipeToClose = (onClose: () => void, {swipeDistance = DEFAULT_SWIPE_DISTANCE} = {}) => {
    // The condition for triggering `onClose` can fire many times in a row;
    // use this ref to keep a reference to whether or not `onClose` has been called yet,
    // so that we only fire it once.
    const closedRef = useRef<boolean>(false);

    // This sets up a spring for changing the horizontal (x-axis) position of the component.
    // Since we only want to swipe horizontally, we don't need the y-axis component.
    const [{x}, set] = useSpring(() => ({x: 0}));

    const bind = useDrag(({dragging, direction: [xDirection], down, movement: [mx]}) => {
        const direction = xDirection < 0 ? -1 : 1;

        // The component is considered 'closed' (i.e. swiped away) once the x offset (`mx`) has exceeded
        // the `swipeDistance` _and_ the user has stopped dragging.
        // The reason for the dragging constraint is so that the user can swipe around with toasts,
        // and basically play with them.
        const isClosed = Math.abs(mx) > swipeDistance && !dragging;

        // Once the component is 'closed', then we want to shoot it off further in the direction that
        // it was swiped, so that it looks 'gone'.
        // Otherwise, the spring's x value is just whatever the current offset is.
        const x = isClosed ? swipeDistance * 1.5 * direction : down ? mx : 0;

        // Want `immediate` turned off while the user is interacting with the component, so that
        // the default 'springy' animations are disabled (while it's moving; they'll turn back on
        // once the user lets go. In effect, the toast will spring back slightly into its starting
        // position).
        set({x, immediate: down});

        if (isClosed && !closedRef.current) {
            closedRef.current = true;
            onClose();
        }
    });

    const style = {
        // Here, opacity is just a function of how much the user has swiped the component,
        // and how close it is to the `swipeDistance` boundary. The closer it, the less opacity.
        opacity: interpolate([x], (x) => (swipeDistance - Math.abs(x)) / swipeDistance),

        // Here, we're applying 1.1 multiplier to the x position, effectively increasing the sensitivity
        // of the user dragging the component.
        //
        // Why? Because I found that 1x wasn't sensitive enough for my tastes. And 1.2x was too much.
        transform: interpolate([x], (x) => `translateX(${1.1 * x}px)`)
    };

    // Pass back all of the props in one so that the consumer just needs to spread them over the
    // `animated` component.
    return {...bind(), style};
};

export default useSwipeToClose;
