import {Meta, StoryObj} from "@storybook/react";
import {smallViewport} from "utils/stories";
import ConfirmationDialog from "./ConfirmationDialog";

const meta: Meta<typeof ConfirmationDialog> = {
    title: "Molecules/Confirmation Dialog",
    component: ConfirmationDialog,
    args: {
        primaryActionLabel: "Delete Account",
        secondaryActionLabel: "Cancel",
        title: "Delete Account?",
        children: "You will permanently lose EVERYTHING!!!"
    }
};

export default meta;
type Story = StoryObj<typeof ConfirmationDialog>;

/** The 'negative' variant of the `ConfirmationDialog`. */
export const Negative: Story = {};

/** The 'negative' variant of the `ConfirmationDialog` in a small layout. */
export const SmallNegative: Story = {
    parameters: {
        ...smallViewport
    }
};
