import {action} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {Input, OverlineHeading, ShadowButton} from "components/atoms";
import Card from "./Card";

const meta: Meta<typeof Card> = {
    title: "Atoms/Card",
    component: Card,
    parameters: {
        backgrounds: {
            default: "dark"
        }
    }
};

export default meta;
type Story = StoryObj<typeof Card>;

/** Just a blank `Card`. Nothing special about it. */
export const Blank: Story = {
    args: {}
};

/** Here's what the `Card` might look like with some elements filled in. */
export const WithElements: Story = {
    args: {
        children: (
            <>
                <OverlineHeading>Login</OverlineHeading>

                <Input placeholder="Enter your email" />
                <Input placeholder="Enter your password" />

                <ShadowButton onClick={action("Login Click")}>Login</ShadowButton>
            </>
        )
    }
};
