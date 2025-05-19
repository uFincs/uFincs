import type {Meta, StoryObj} from "@storybook/react";
import {storyUsingRedux, useCreateImportRules} from "utils/stories";
import ImportRulesTableRow from "./ImportRulesTableRow";

const meta: Meta<typeof ImportRulesTableRow> = {
    title: "Molecules/Import Rules Table Row",
    component: ImportRulesTableRow
};

export default meta;
type Story = StoryObj<typeof ImportRulesTableRow>;

/** The default view of `ImportRulesTableRow`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <ImportRulesTableRow {...args} id={rules?.[1]?.id} />;
    })
};
