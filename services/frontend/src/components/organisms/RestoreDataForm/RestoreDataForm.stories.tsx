import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as RestoreDataForm} from "./RestoreDataForm";

const meta: Meta<typeof RestoreDataForm> = {
    title: "Organisms/Restore Data Form",
    component: RestoreDataForm
};

export default meta;
type Story = StoryObj<typeof RestoreDataForm>;

/** The default view of `RestoreDataForm`. */
export const Default: Story = {};
