import type {Meta, StoryObj} from "@storybook/react";
import {storyUsingRedux, useCreateImportRules} from "utils/stories";
import {PureComponent as ImportOverview} from "./ImportOverview";

const meta: Meta<typeof ImportOverview> = {
    title: "Scenes/Import Overview",
    component: ImportOverview
};

export default meta;
type Story = StoryObj<typeof ImportOverview>;

/** The default view of `ImportOverview`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <ImportOverview importRules={rules} {...args} />;
    })
};
