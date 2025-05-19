import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import DateRangePicker from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
    title: "Organisms/Date Range Picker",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: DateRangePicker
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

/** The default view of the `DateRangePicker`. */
export const Default: Story = {};

/** The small view of the `DateRangePicker`. */
export const Small: Story = {
    parameters: {...smallViewport}
};
