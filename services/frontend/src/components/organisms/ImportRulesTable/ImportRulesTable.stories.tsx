import type {Meta, StoryObj} from "@storybook/react";
import {storyUsingRedux, useCreateImportRules} from "utils/stories";
import ImportRulesTable from "./ImportRulesTable";

const meta: Meta<typeof ImportRulesTable> = {
    title: "Organisms/Import Rules Table",
    component: ImportRulesTable
};

export default meta;
type Story = StoryObj<typeof ImportRulesTable>;

/** The default view of `ImportRulesTable`. */
export const Default: Story = {
    render: storyUsingRedux(() => {
        const rules = useCreateImportRules();

        return <ImportRulesTable importRules={rules} />;
    })
};

/** The empty view of the `ImportRulesTable`. */
export const Empty: Story = {
    render: storyUsingRedux(() => {
        useCreateImportRules([]);

        return <ImportRulesTable importRules={[]} />;
    })
};
