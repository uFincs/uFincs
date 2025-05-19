import {Meta, StoryObj} from "@storybook/react";
import {DocumentIcon} from "assets/icons";
import ImportOptionButton from "./ImportOptionButton";

const meta: Meta<typeof ImportOptionButton> = {
    title: "Molecules/Import Option Button",
    component: ImportOptionButton,
    args: {
        label: "CSV File",
        Icon: DocumentIcon
    }
};

export default meta;
type Story = StoryObj<typeof ImportOptionButton>;

/** The default view of `ImportOptionButton`. */
export const Default: Story = {};
