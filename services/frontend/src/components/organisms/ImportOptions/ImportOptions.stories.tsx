import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as ImportOptions} from "./ImportOptions";

const meta: Meta<typeof ImportOptions> = {
    title: "Organisms/Import Options",
    component: ImportOptions
};

export default meta;
type Story = StoryObj<typeof ImportOptions>;

/** The default view of `ImportOptions`. */
export const Default: Story = {};
