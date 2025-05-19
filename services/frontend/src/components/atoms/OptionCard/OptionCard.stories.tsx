import type {Meta, StoryObj} from "@storybook/react";
import classNames from "classnames";
import {smallViewport} from "utils/stories";
import OptionCard from "./OptionCard";

type Story = StoryObj<typeof OptionCard>;

const meta: Meta<typeof OptionCard> = {
    title: "Atoms/Option Card",
    component: OptionCard,
    args: {
        className: "OptionCard--story-sample",
        active: false,
        disabled: false
    }
};

export default meta;

/** An example of the 'base' (non active) view of an `OptionCard`. */
export const Base: Story = {};

/** An example of the active view of an `OptionCard`. */
export const Active: Story = {
    args: {
        active: true
    }
};

/** An example of the disabled view of an `OptionCard`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** An example of a set of `OptionCard`s lined up as a picker. */
export const PickerExample: Story = {
    render: () => (
        <div className="OptionCard--story-container">
            <OptionCard>Asset</OptionCard>

            <OptionCard active={true}>Liability</OptionCard>

            <OptionCard>Income</OptionCard>

            <OptionCard>Expense</OptionCard>
        </div>
    )
};

PickerExample.parameters = smallViewport;

/** An `OptionCard` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: classNames("Element--story-FocusOutline", "OptionCard--story-sample")
    }
};
