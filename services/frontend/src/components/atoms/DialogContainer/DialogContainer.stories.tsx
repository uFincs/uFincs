import type {Meta, StoryObj} from "@storybook/react";
import DialogContainer from "./DialogContainer";

const meta: Meta<typeof DialogContainer> = {
    title: "Atoms/Dialog Container",
    component: DialogContainer,
    args: {
        isVisible: true,
        title: "Test Dialog"
    }
};

export default meta;
type Story = StoryObj<typeof DialogContainer>;

/** The default view of `DialogContainer`. */
export const Default: Story = {};
