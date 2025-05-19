import type {Meta, StoryObj} from "@storybook/react";
import UndoToast from "./UndoToast";

const meta: Meta<typeof UndoToast> = {
    title: "Molecules/Undo Toast",
    component: UndoToast
};

export default meta;
type Story = StoryObj<typeof UndoToast>;

/** The default view of an `UndoToast`. */
export const Default: Story = {
    args: {
        message: "Deleted account 123"
    }
};
