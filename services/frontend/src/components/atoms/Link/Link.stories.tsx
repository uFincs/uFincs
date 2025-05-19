import type {Meta, StoryObj} from "@storybook/react";
import Link from "./Link";

const meta: Meta<typeof Link> = {
    title: "Atoms/Link",
    component: Link,
    args: {
        to: "/login",
        children: "Login"
    }
};

export default meta;
type Story = StoryObj<typeof Link>;

/** What a regular `Link` looks like. */
export const Default: Story = {};

/** A `Link` with the focus outline forcefully applied. */
export const FocusOutline: Story = {
    args: {
        className: "Element--story-FocusOutline"
    }
};
