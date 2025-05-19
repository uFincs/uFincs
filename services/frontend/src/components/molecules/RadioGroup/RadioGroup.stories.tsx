import type {Meta, StoryObj} from "@storybook/react";
import RadioGroup from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
    title: "Molecules/Radio Group",
    component: RadioGroup,
    args: {
        id: "Story-Default",
        label: "Some Options",
        options: [
            {label: "option 1", value: "option1"},
            {label: "option 2", value: "option2"},
            {label: "option 3", value: "option3"}
        ],
        value: "option1",
        disabled: false
    }
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

/** The view of the `RadioGroup` using the default option components. */
export const DefaultOptions: Story = {
    args: {
        label: "Some Options"
    }
};

/** The disabled view of the `RadioGroup`; none of the options should be clickable. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};
