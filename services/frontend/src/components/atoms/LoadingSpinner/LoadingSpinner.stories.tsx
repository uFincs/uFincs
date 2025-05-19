import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport} from "utils/stories";
import LoadingSpinner from "./LoadingSpinner";

const meta: Meta<typeof LoadingSpinner> = {
    title: "Atoms/Loading Spinner",
    component: LoadingSpinner,
    args: {
        loading: true
    }
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

/** A `LoadingSpinner` that loads. */
export const Normal: Story = {};

/** What the `LoadingSpinner` looks like on small devices. */
export const Small: Story = {
    parameters: smallViewport
};
