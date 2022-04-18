import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import FormHeader from "./FormHeader";

export default {
    title: "Molecules/Form Header",
    component: FormHeader
};

const formActions = actions("onClose");

const nameKnob = () => text("Entity Name", "Transaction");
const editingKnob = () => boolean("Is Editing", false);

/** The default view of `FormHeader`. */
export const Default = () => (
    <FormHeader
        closeButtonTestId="test"
        entityName={nameKnob()}
        isEditing={editingKnob()}
        {...formActions}
    />
);
