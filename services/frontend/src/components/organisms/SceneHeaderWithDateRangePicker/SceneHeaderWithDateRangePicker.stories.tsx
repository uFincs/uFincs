import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import SceneHeaderWithDateRangePicker from "./SceneHeaderWithDateRangePicker";

const meta: Meta<typeof SceneHeaderWithDateRangePicker> = {
    title: "Organisms/Scene Header with Date Range Picker",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: SceneHeaderWithDateRangePicker,
    args: {
        title: "Dashboard"
    }
};

export default meta;

type Story = StoryObj<typeof SceneHeaderWithDateRangePicker>;

/** The large view of the `SceneHeaderWithDateRangePicker`. */
export const Large: Story = {};

/** The small view of the `SceneHeaderWithDateRangePicker`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
