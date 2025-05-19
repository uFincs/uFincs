import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport} from "utils/stories";
import {PureComponent as AppNavigation} from "./AppNavigation";

const meta: Meta<typeof AppNavigation> = {
    title: "Organisms/App Navigation",
    component: AppNavigation,
    args: {
        active: 0
    }
};

export default meta;
type Story = StoryObj<typeof AppNavigation>;

/** The large view of the `AppNavigation`; this is the complete header that runs across the top. */
export const Large: Story = {};

/** The small view of the `AppNavigation`; this is the compact bar at the bottom.  */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
