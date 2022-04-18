import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import {LabelledInput} from "components/molecules";
import FormContainer from "./FormContainer";

export default {
    title: "Molecules/Form Container",
    component: FormContainer
};

const formActions = actions("onClose", "onMakeAnother", "onSubmit");

const nameKnob = () => text("Entity Name", "Transaction");
const editingKnob = () => boolean("Is Editing", false);
const errorKnob = () => text("Submission Error", "");

/** The default view of `FormContainer`. */
export const Default = () => (
    <FormContainer
        closeButtonTestId="test"
        entityName={nameKnob()}
        isEditing={editingKnob()}
        submissionError={errorKnob()}
        {...formActions}
    >
        <LabelledInput label="Description" />
    </FormContainer>
);
