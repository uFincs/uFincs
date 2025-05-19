import type {Meta, StoryObj} from "@storybook/react";
import BackButton from "./BackButton";

const meta: Meta<typeof BackButton> = {
    title: "Atoms/Back Button",
    component: BackButton
};

export default meta;
type Story = StoryObj<typeof BackButton>;

/** The default view of a `BackButton`. */
export const Default: Story = {
    args: {}
};

/** The disabled view of a `BackButton`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** A `BackButton` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: "Element--story-FocusOutline"
    }
};
