import {actions} from "@storybook/addon-actions";
import React from "react";
import {Input} from "components/atoms";
import {smallViewport} from "utils/stories";
import FormCardContainer from "./FormCardContainer";

export default {
    title: "Atoms/Form Card Container",
    component: FormCardContainer
};

const cardActions = actions("onRemove");

/** The default view of `FormCardContainer`. */
export const Default = () => (
    <FormCardContainer
        topRowChildren={<Input noErrorIcon={true} />}
        bottomRowChildren={<Input noErrorIcon={true} />}
        {...cardActions}
    />
);

/** The small view of `FormCardContainer`. */
export const Small = () => (
    <FormCardContainer
        topRowChildren={<Input noErrorIcon={true} />}
        bottomRowChildren={<Input noErrorIcon={true} />}
        {...cardActions}
    />
);

Small.parameters = smallViewport;
