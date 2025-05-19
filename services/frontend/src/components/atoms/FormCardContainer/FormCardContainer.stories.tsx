import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport} from "utils/stories";
import Input from "../Input";
import FormCardContainer from "./FormCardContainer";

const meta: Meta<typeof FormCardContainer> = {
    title: "Atoms/Form Card Container",
    component: FormCardContainer,
    args: {
        topRowChildren: <Input noErrorIcon={true} />,
        bottomRowChildren: <Input noErrorIcon={true} />,
        ...actions("onRemove")
    }
};

export default meta;
type Story = StoryObj<typeof FormCardContainer>;

/** The default view of `FormCardContainer`. */
export const Default: Story = {};

/** The small view of `FormCardContainer`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
