import classNames from "classnames";
import React, {useEffect, useState} from "react";
import {circularCountDownInterval} from "utils/parsedStyles";
import "./CircularCountdown.scss";

const VIEWBOX_SIZE = 100;

// Why is the radius 45? Because the article I stole this timer from used 45.
// See the component's docstring for the article.
const RADIUS = VIEWBOX_SIZE / 2 - 5;
const CIRCUMFERENCE = Math.round(2 * Math.PI * RADIUS);

const calculateRemainingPath = (timeLeft: number, timeLimit: number) => {
    const timeFraction = Math.max(0, (timeLeft / timeLimit) * CIRCUMFERENCE);
    return `${timeFraction.toFixed(0)} ${CIRCUMFERENCE}`;
};

interface CircularCountdownProps {
    /** Custom class name. */
    className?: string;

    /** Custom class name for the remaining path class name.
     *  Useful for more easily changing things like its color or stroke width. */
    pathClassName?: string;

    /** The ref to the element that, when hovered, will cause the countdown to pause. */
    pauseRef?: React.MutableRefObject<HTMLElement | null>;

    /** The number of seconds that should be counted down. */
    timeLimit?: number;

    /** Handler for when time runs out. */
    onTimesUp: () => void;

    /** Anything to show inside the countdown (e.g. an icon). */
    children?: React.ReactNode;
}

/** A countdown timer in the shape of a circle.
 *
 *  Useful for things like toasts, where the close button can be wrapped in this to
 *  show a little countdown for when the toast will close itself.
 *
 *  Heavily inspired by the following:
 *  https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/
 */
const CircularCountdown = ({
    className,
    pathClassName,
    pauseRef,
    timeLimit = 10,
    onTimesUp,
    children
}: CircularCountdownProps) => {
    // The 'stroke-dasharray' is a property on the `path` element.
    // It is what we use to change the 'length' of the path to simulate the countdown effect.
    // See the above article for more details.
    const [dashArray, setDashArray] = useState(`${CIRCUMFERENCE}`);

    // Need state for when it's finished so that we can hide the remaining path;
    // it doesn't actually collapse to nothing when dash array reaches 0.
    const [timesUp, setTimesUp] = useState(false);

    useEffect(() => {
        let finalTimeout: number;

        let timePassed = 0;
        let paused = false;

        const countdown = () => {
            if (paused) {
                return;
            }

            timePassed += 1;
            const timeLeft = timeLimit - timePassed;

            // Update the position of the remaining path.
            setDashArray(calculateRemainingPath(timeLeft, timeLimit));

            if (timeLeft === 0) {
                window.clearInterval(interval);

                // Delay changing the state by an interval so that the path doesn't immediately
                // disappear once the time limit is reached.
                finalTimeout = window.setTimeout(() => {
                    setTimesUp(true);
                    onTimesUp();
                }, circularCountDownInterval);
            }
        };

        const interval = window.setInterval(countdown, circularCountDownInterval);

        const startInterval = () => (paused = false);
        const endInterval = () => (paused = true);

        const pauseElement = pauseRef?.current;

        // We want to pause the timer when the user mouses into/over the toast.
        // Note that there is a downside to implementing it naively like this: the countdown
        // won't appear to stop immediately at the exact moment the user mouses in. This is
        // because we can currently only pause the countdown in discrete increments of 1 second.
        //
        // As such, if the user mouses in at the start of a 1s animation, then they'll see
        // the countdown ticking down for that discrete tick before it stops.
        //
        // The same kind of thing applies for leaving: the countdown restart immediately because
        // the user could leave anywhere in that 1s interval before it fires again.
        pauseElement?.addEventListener("mouseenter", endInterval);
        pauseElement?.addEventListener("focus", endInterval);
        pauseElement?.addEventListener("focusin", endInterval);

        pauseElement?.addEventListener("mouseleave", startInterval);
        pauseElement?.addEventListener("focusout", startInterval);

        return () => {
            window.clearInterval(interval);
            window.clearTimeout(finalTimeout);

            pauseElement?.removeEventListener("mouseenter", endInterval);
            pauseElement?.removeEventListener("focus", endInterval);
            pauseElement?.removeEventListener("focusin", endInterval);

            pauseElement?.removeEventListener("mouseleave", startInterval);
            pauseElement?.removeEventListener("focusout", startInterval);
        };

        // Only run this effect once on mount. We're doing this this because it's less messy
        // than memoizing onTimesUp in ToastMessages (which would really require doing something
        // like connecting the toasts directly to the store and passing in IDs like we do for
        // normal lists -- except I'm taking the lazy route here).
        //
        // If we _don't_ only run it once, then because onTimesUp gets re-created in ToastMessages
        // every time a new toast is added, then all toasts will have their time sped up
        // whenever a new toast gets added.
        //
        // YES, this whole implementation is thus pretty hacky. Taking on the tech debt.
        // eslint-disable-next-line
    }, []);

    return (
        <div className={classNames("CircularCountdown-container", className)}>
            <svg
                className="CircularCountdown"
                viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    className={classNames(
                        "CircularCountdown-remaining",
                        {
                            "CircularCountdown-remaining--times-up": timesUp
                        },
                        pathClassName
                    )}
                    strokeDasharray={dashArray}
                    // Move the point to the (absolute) center of the viewbox.
                    // M 50, 50
                    //
                    // Move the point up (relatively) the radius of the circle.
                    // m -${RADIUS}, 0
                    //
                    // Draw the left half of the circle.
                    // a ${RADIUS},${RADIUS} 0 1,0 90,0
                    //
                    // Draw the right half of the circle.
                    // a ${RADIUS},${RADIUS} 0 1,0 -90,0
                    d={`
                        M 50, 50
                        m -${RADIUS}, 0
                        a ${RADIUS},${RADIUS} 0 1,0 90,0
                        a ${RADIUS},${RADIUS} 0 1,0 -90,0
                    `}
                ></path>
            </svg>

            <div className="CircularCountdown-content">{children}</div>
        </div>
    );
};

export default CircularCountdown;
