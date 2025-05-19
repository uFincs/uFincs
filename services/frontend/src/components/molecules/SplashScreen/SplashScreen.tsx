import classNames from "classnames";
import {useEffect} from "react";
import {animated, config, useTransition} from "react-spring";
import {AnimatedLogo} from "components/atoms";
import {useForceRerender} from "hooks/";
import connect, {ConnectedProps} from "./connect";
import "./SplashScreen.scss";

interface SplashScreenProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A screen to show while the app boot process is happening after a login occurs. */
const SplashScreen = ({className, isOpen = false}: SplashScreenProps) => {
    const transition = useTransition(isOpen, {
        // Open the splash screen without any animation, so that it shows up immediately,
        // but use an animation when closing.
        config: isOpen ? {duration: 0} : config.default,
        from: {opacity: 0},
        enter: {opacity: 1},
        leave: {opacity: 0}
    });

    const forceRerender = useForceRerender();

    useEffect(() => {
        if (isOpen) {
            // HACK: I don't know why, but the looping animation of the AnimatedLogo doesn't work when
            // used under a `react-spring` transition, unless the component re-renders again.
            // AKA, hacky workaround.
            //
            // Hopefully this is just because `react-spring` v9 is still a release candidate and this'll
            // get fixed eventually.
            forceRerender();
        }
    }, [isOpen, forceRerender]);

    return transition(
        (styles, isOpen) =>
            isOpen && (
                // @ts-expect-error Missing children prop: https://github.com/pmndrs/react-spring/issues/2358
                <animated.div
                    className={classNames("SplashScreen", className)}
                    style={styles as any}
                    aria-busy="true"
                    aria-label="Loading app..."
                    aria-live="assertive"
                    role="alert"
                >
                    <AnimatedLogo />
                </animated.div>
            )
    );
};

export const PureComponent = SplashScreen;
export const ConnectedSplashScreen = connect(SplashScreen);
export default ConnectedSplashScreen;
