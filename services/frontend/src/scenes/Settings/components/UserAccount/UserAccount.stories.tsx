import type {Meta, StoryObj} from "@storybook/react";
import UserAccount from "./UserAccount";

const meta: Meta<typeof UserAccount> = {
    title: "Scenes/Settings/Sections/User Account",
    component: UserAccount
};

export default meta;
type Story = StoryObj<typeof UserAccount>;

/** The default view of `UserAccount`. */
export const Default: Story = {
    args: {}
};
