import {action} from "@storybook/addon-actions";
import React from "react";
import {Input, OverlineHeading, ShadowButton} from "components/atoms";
import Card from "./Card";

export default {
    title: "Atoms/Card",
    component: Card,
    parameters: {
        backgrounds: {
            default: "dark"
        }
    }
};

/** Just a blank `Card`. Nothing special about it. */
export const Blank = () => <Card />;

/** Here's what the `Card` might look like with some elements filled in. */
export const WithElements = () => (
    <Card className="Card--story-WithElements">
        <OverlineHeading>Login</OverlineHeading>

        <Input placeholder="Enter your email" />
        <Input placeholder="Enter your password" />

        <ShadowButton onClick={action("Login Click")}>Login</ShadowButton>
    </Card>
);
