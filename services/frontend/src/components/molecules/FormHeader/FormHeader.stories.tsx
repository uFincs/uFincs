import type {Meta, StoryObj} from "@storybook/react";
import FormHeader from "./FormHeader";

const meta: Meta<typeof FormHeader> = {
    title: "Molecules/Form Header",
    component: FormHeader,
    args: {
        closeButtonTestId: "test",
        entityName: "Transaction",
        isEditing: false
    }
};

export default meta;
type Story = StoryObj<typeof FormHeader>;

/** The default view of `FormHeader`. */
export const Default: Story = {};
