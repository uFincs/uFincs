import {actions} from "@storybook/addon-actions";
import {number} from "@storybook/addon-knobs";
import React, {useRef} from "react";
import {CloseIcon} from "assets/icons";
import CircularCountdown from "./CircularCountdown";

export default {
    title: "Atoms/Circular Countdown",
    component: CircularCountdown
};

const countdownActions = actions("onTimesUp");
const timeLimitKnob = () => number("Time Limit", 10);

/** A rare `CircularCountdown` that is just the countdown with nothing in it. */
export const Empty = () => <CircularCountdown timeLimit={timeLimitKnob()} {...countdownActions} />;

/** A typical `CircularCountdown` that has something in it -- in this case, an icon. */
export const WithIcon = () => (
    <CircularCountdown {...countdownActions}>
        <CloseIcon />
    </CircularCountdown>
);

/** A demonstration of the ability for the countdown to pause when hovering over some element. */
export const HoverToPause = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef}>
            <CircularCountdown
                pauseRef={containerRef}
                timeLimit={timeLimitKnob()}
                {...countdownActions}
            />
        </div>
    );
};
