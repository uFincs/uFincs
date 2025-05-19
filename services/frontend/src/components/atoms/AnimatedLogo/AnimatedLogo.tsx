import classNames from "classnames";
import {animated, to as interpolate, useSpring} from "react-spring";
import {colors} from "utils/styles";
import "./AnimatedLogo.scss";

const BAR_X_INITIAL = 3;
const BAR_WIDTH = 22;

interface AnimatedLogoProps {
    /** Custom class name. */
    className?: string;
}

/** An animated version of the standalone logo. Useful for things like the `SplashScreen`. */
const AnimatedLogo = ({className}: AnimatedLogoProps) => {
    // This animates the 'U' in the logo.
    // Specifically, it animates the color (`fill`) of the 'U', giving it this
    // calm pulsating effect.
    const {fill} = useSpring({
        loop: {reverse: true},
        from: {fill: colors.colorNeutral200},
        to: {fill: colors.colorNeutral700},
        config: {
            // We want the 'U' to pulse at a different rate than the speed of the bar.
            // Why? Because it looks cooler that way.
            // This config makes it slower than the bar.
            mass: 1,
            tension: 220,
            friction: 40
        }
    });

    // This animates the overline bar in the logo.
    // Specifically, it animates the width of the bar to be like a loading bar.
    // `flip` is used to determine when the looping animation has reversed, so that
    // we can 'flip' the direction that the bar animates.
    const {width, flip} = useSpring({
        loop: {reverse: true},
        from: {width: 0, flip: false},
        to: {width: BAR_WIDTH, flip: true},
        config: {
            // We want the bar to animate faster than the 'U'.
            mass: 1,
            tension: 160,
            friction: 25
        }
    });

    return (
        // Lines get long. Lots of props. Don't really care. Cause it's an SVG.
        /* eslint-disable */
        // @ts-expect-error Missing children prop: https://github.com/pmndrs/react-spring/issues/2358
        <animated.div className={classNames("AnimatedLogo", className)}>
            {/* @ts-expect-error As above. */}
            <animated.svg width="28" height="40" viewBox="0 0 28 40" fill="none">
                <animated.rect
                    // @ts-expect-error As above.
                    x={interpolate([width, flip], (width, flip) =>
                        flip ? BAR_X_INITIAL : BAR_WIDTH - (width as number) + BAR_X_INITIAL
                    )}
                    y="2.2"
                    width={width}
                    height="5"
                    rx="2.5"
                    fill={colors.colorPrimary500}
                />

                <animated.path
                    // @ts-expect-error As above.
                    d="M9 13.5C9 11.8431 7.65685 10.5 6 10.5C4.34315 10.5 3 11.8431 3 13.5H9ZM25 13.5C25 11.8431 23.6569 10.5 22 10.5C20.3431 10.5 19 11.8431 19 13.5H25ZM25 25.2826V13.5H19V25.2826H25ZM3 13.5V21H9V13.5H3ZM3 21V25.2826H9V21H3ZM16.5133 35.9916C21.4852 34.8248 25 30.3895 25 25.2826H19C19 27.6039 17.4023 29.62 15.1424 30.1504L16.5133 35.9916ZM11.4867 35.9916C13.1398 36.3796 14.8602 36.3796 16.5133 35.9916L15.1424 30.1504C14.391 30.3267 13.609 30.3267 12.8576 30.1504L11.4867 35.9916ZM12.8576 30.1504C10.5977 29.62 9 27.6039 9 25.2826H3C3 30.3895 6.51485 34.8248 11.4867 35.9916L12.8576 30.1504Z"
                    fill={fill}
                />
            </animated.svg>
        </animated.div>
        /* eslint-enable */
    );
};

export default AnimatedLogo;
