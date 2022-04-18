import React, {useCallback, useEffect, useRef, useState} from "react";
import useEscapeKeyCloseable from "./useEscapeKeyCloseable";

export interface CloseableContainerProps<RefType extends HTMLElement> {
    ref: React.MutableRefObject<RefType | null>;
    onBlur: (e: React.FocusEvent<RefType>) => void;
}

export interface OutsideCloseableData<RefType extends HTMLElement> {
    closeableContainerProps: CloseableContainerProps<RefType>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Hook that can be used to provide components with the ability to be closed by
 *  clicking outside of them, pressing the Escape key, or removing their focus. */
const useOutsideCloseable = <RefType extends HTMLElement>(
    initialValue: boolean = false,
    onClose: undefined | (() => void) = undefined
): OutsideCloseableData<RefType> => {
    const [isOpen, setIsOpen] = useState(initialValue);
    const ref: React.MutableRefObject<RefType | null> = useRef<RefType | null>(null);

    const finalOnClose = useCallback(() => {
        if (ref.current) {
            if (onClose) {
                onClose();
            } else {
                setIsOpen(false);
            }
        }
    }, [onClose]);

    const onOutsideClick = useCallback(
        (e: MouseEvent): void => {
            if (ref?.current && e.target instanceof Node && !ref?.current?.contains?.(e.target)) {
                finalOnClose();
            }
        },
        [finalOnClose]
    );

    const onBlur = useCallback(
        (e: React.FocusEvent<RefType>): void => {
            // Inspired by https://gist.github.com/pstoica/4323d3e6e37e8a23dd59
            const currentTarget = e?.currentTarget;

            setTimeout(() => {
                if (
                    currentTarget instanceof Node &&
                    !currentTarget?.contains?.(document.activeElement)
                ) {
                    finalOnClose();
                }
            }, 0);
        },
        [finalOnClose]
    );

    useEffect(() => {
        document.addEventListener("mousedown", onOutsideClick);

        return () => {
            document.removeEventListener("mousedown", onOutsideClick);
        };
    }, [onOutsideClick]);

    useEscapeKeyCloseable(isOpen, finalOnClose);

    const closeableContainerProps = {ref, onBlur};
    return {closeableContainerProps, isOpen, setIsOpen};
};

export default useOutsideCloseable;
