import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import DateRangeSizePicker from "./DateRangeSizePicker";

const meta: Meta<typeof DateRangeSizePicker> = {
    title: "Molecules/Date Range Size Picker",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: DateRangeSizePicker,
    args: {}
};

export default meta;
type Story = StoryObj<typeof DateRangeSizePicker>;

/** The large (desktop) view of the `DateRangeSizePicker`. This view uses separate buttons for
 *  each option, thus allowing the user to see all the options at a glance. */
export const Large: Story = {};

/** The small (mobile) view of the `DateRangeSizePicker`. This view uses a select input
 *  to compress all of the options into as little space as possible. */
export const Small: Story = {
    parameters: {...smallViewport}
};
