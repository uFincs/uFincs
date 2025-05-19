import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import Sidebar from "./Sidebar";

const meta: Meta<typeof Sidebar> = {
    title: "Atoms/Sidebar",
    component: Sidebar,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** The `Sidebar` as a basic container with some basic content. */
export const Large: Story = {};

/** The `Sidebar` takes up the whole screen on small devices. */
export const Small: Story = {};

Small.parameters = smallViewport;

/** The `Sidebar` should still work in landscape. */
export const SmallLandscape: Story = {};

SmallLandscape.parameters = smallLandscapeViewport;
