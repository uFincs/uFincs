import type {Meta, StoryObj} from "@storybook/react";
import {useEffect} from "react";
import {useDateRange, DateRangeProvider} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {smallViewport} from "utils/stories";
import DateSwitcher from "./DateSwitcher";

const meta: Meta<typeof DateSwitcher> = {
    title: "Molecules/Date Switcher",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: DateSwitcher
};

export default meta;
type Story = StoryObj<typeof DateSwitcher>;

/** The default view of the `DateSwitcher`. */
export const Default: Story = {};

/** The small view of the `DateSwitcher`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

const DisabledComponent = () => {
    const {dispatch} = useDateRange();

    useEffect(() => {
        dispatch.setRangeSize(DateRangeSize.allTime);
    }, [dispatch]);

    return <DateSwitcher />;
};

/** The disabled view of the `DateSwitcher`. */
export const Disabled: Story = {
    render: () => <DisabledComponent />
};
