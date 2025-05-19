import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import ImportRulesListItem from "./ImportRulesListItem";

const meta: Meta<typeof ImportRulesListItem> = {
    title: "Molecules/Import Rules List Item",
    component: ImportRulesListItem
};

export default meta;
type Story = StoryObj<typeof ImportRulesListItem>;

/** The default view of `ImportRulesListItem`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <ImportRulesListItem {...args} id={rules?.[0]?.id} />;
    })
};

/** The small view of `ImportRulesListItem`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <ImportRulesListItem {...args} id={rules?.[0]?.id} />;
    })
};
