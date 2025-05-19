import type {Meta, StoryObj} from "@storybook/react";
import {useRef} from "react";
import {CloseIcon} from "assets/icons";
import {storyUsingRedux} from "utils/stories";
import CircularCountdown from "./CircularCountdown";

const meta: Meta<typeof CircularCountdown> = {
    title: "Atoms/Circular Countdown",
    component: CircularCountdown,
    args: {
        timeLimit: 10
    }
};

export default meta;

type Story = StoryObj<typeof CircularCountdown>;

/** A rare `CircularCountdown` that is just the countdown with nothing in it. */
export const Empty: Story = {};

/** A typical `CircularCountdown` that has something in it -- in this case, an icon. */
export const WithIcon: Story = {
    args: {
        children: <CloseIcon />
    }
};

/** A demonstration of the ability for the countdown to pause when hovering over some element. */
export const HoverToPause: Story = {
    render: storyUsingRedux((args) => {
        const containerRef = useRef<HTMLDivElement>(null);

        return (
            <div ref={containerRef}>
                <CircularCountdown pauseRef={containerRef} {...args} />
            </div>
        );
    })
};
