import type {Meta, StoryObj} from "@storybook/react";
import CloseButton from "./CloseButton";

const meta: Meta<typeof CloseButton> = {
    title: "Atoms/Close Button",
    component: CloseButton
};

export default meta;
export type Story = StoryObj<typeof CloseButton>;

/** The default view of a `CloseButton`. */
export const Default: Story = {};

/** The disabled view of a `CloseButton`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** A `CloseButton` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: "Element--story-FocusOutline"
    }
};
