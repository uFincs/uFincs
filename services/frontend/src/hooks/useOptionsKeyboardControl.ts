import {createRef, useCallback, useRef} from "react";
import {MathUtils} from "services/";
import KeyCodes from "values/keyCodes";

/** This enables using Home, End, and left/right/up/down arrow keys to traverse a list of options.
 *  All of these operations immediately change the currently active option.
 *
 *  Inspiration for the accessible key code handling was taken from:
 *  https://dev.to/link2twenty/accessibility-first-tabs-ken */
const useOptionsKeyboardControl = (
    numberOfOptions: number,
    activeIndex: number,
    setActiveIndex: (index: number) => void
) => {
    const optionRefs = useRef([...Array(numberOfOptions).keys()].map(() => createRef<any>()));

    const onContainerKeyDown = useCallback(
        (e: React.KeyboardEvent<any>) => {
            let newPosition: number = -1;

            switch (e.keyCode) {
                case KeyCodes.END:
                    e.preventDefault();
                    newPosition = numberOfOptions - 1;

                    break;
                case KeyCodes.HOME:
                    e.preventDefault();
                    newPosition = 0;

                    break;
                case KeyCodes.LEFT_ARROW:
                case KeyCodes.UP_ARROW:
                    e.preventDefault();
                    newPosition = MathUtils.decrementWithWrapping(activeIndex, numberOfOptions);

                    break;
                case KeyCodes.RIGHT_ARROW:
                case KeyCodes.DOWN_ARROW:
                    e.preventDefault();
                    newPosition = MathUtils.incrementWithWrapping(activeIndex, numberOfOptions);

                    break;
            }

            if (newPosition !== -1) {
                setActiveIndex(newPosition);
                optionRefs.current[newPosition]?.current?.focus();
            }
        },
        [activeIndex, numberOfOptions, optionRefs, setActiveIndex]
    );

    // Lets the user hit Enter or Space while focused on an option to select it.
    const onItemKeyDown = useCallback(
        (index: number) => (e: React.KeyboardEvent<any>) => {
            if (e.keyCode === KeyCodes.ENTER || e.keyCode === KeyCodes.SPACE) {
                e.preventDefault();
                setActiveIndex(index);
            }
        },
        [setActiveIndex]
    );

    return {onContainerKeyDown, onItemKeyDown, optionRefs};
};

export default useOptionsKeyboardControl;
