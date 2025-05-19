import type {Meta, StoryObj} from "@storybook/react";
import UserAvatar from "./UserAvatar";

const meta: Meta<typeof UserAvatar> = {
    title: "Atoms/User Avatar",
    component: UserAvatar
};

export default meta;
type Story = StoryObj<typeof UserAvatar>;

/** The default view of the `UserAvatar`. */
export const Default: Story = {};
