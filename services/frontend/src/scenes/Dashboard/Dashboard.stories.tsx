import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import Dashboard from "./Dashboard";

const meta: Meta<typeof Dashboard> = {
    title: "Scenes/Dashboard",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: Dashboard
};

export default meta;

type Story = StoryObj<typeof Dashboard>;

/** The large view of the `Dashboard` scene. */
export const Large: Story = {};

/** The small view of the `Dashboard` scene. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
