import type {Meta, StoryObj} from "@storybook/react";
import {LabelledInput} from "components/molecules";
import FormContainer from "./FormContainer";

const meta: Meta<typeof FormContainer> = {
    title: "Molecules/Form Container",
    component: FormContainer,
    args: {
        closeButtonTestId: "test",
        entityName: "Transaction",
        isEditing: false,
        submissionError: ""
    }
};

export default meta;
type Story = StoryObj<typeof FormContainer>;

/** The default view of `FormContainer`. */
export const Default: Story = {
    render: (args) => (
        <FormContainer {...args}>
            <LabelledInput label="Description" />
        </FormContainer>
    )
};
