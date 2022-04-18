import classNames from "classnames";
import React, {useRef} from "react";
import {CSSTransition} from "react-transition-group";
import {transitionShortLength as animationTime} from "utils/parsedStyles";
import connect, {ConnectedProps} from "./connect";
import "./BackgroundBlur.scss";

interface BackgroundBlurProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A filter for the entire screen behind a modal dialog/form;
 *  darkens and blurs the background to put more focus on the dialog/form.
 */
const BackgroundBlur = ({className, isVisible}: BackgroundBlurProps) => {
    const backgroundRef = useRef<HTMLDivElement | null>(null);

    return (
        <CSSTransition
            in={isVisible}
            nodeRef={backgroundRef}
            timeout={animationTime}
            classNames="BackgroundBlur"
            unmountOnExit={true}
        >
            <div
                className={classNames("BackgroundBlur", className)}
                aria-hidden={true}
                ref={backgroundRef}
            />
        </CSSTransition>
    );
};

export default connect(BackgroundBlur);
