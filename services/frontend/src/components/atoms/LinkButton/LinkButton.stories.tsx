import type {Meta, StoryObj} from "@storybook/react";
import LinkButton from "./LinkButton";

const meta: Meta<typeof LinkButton> = {
    title: "Atoms/Link Button",
    component: LinkButton,
    args: {
        disabled: false,
        children: "Optional details"
    }
};

export default meta;
type Story = StoryObj<typeof LinkButton>;

/** What a regular `LinkButton` looks like: some text. */
export const Default: Story = {};

/** A non-interactive disabled `LinkButton`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** A `LinkButton` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: "Element--story-FocusOutline"
    }
};
