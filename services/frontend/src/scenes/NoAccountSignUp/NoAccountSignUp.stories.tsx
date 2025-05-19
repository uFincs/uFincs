import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as NoAccountSignUp} from "./NoAccountSignUp";

const meta: Meta<typeof NoAccountSignUp> = {
    title: "Scenes/No Account Sign Up",
    component: NoAccountSignUp
};

export default meta;
type Story = StoryObj<typeof NoAccountSignUp>;

/** The default view of `NoAccountSignUp`. */
export const Default: Story = {};
