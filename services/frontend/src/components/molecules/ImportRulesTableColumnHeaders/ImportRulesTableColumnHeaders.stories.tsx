import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import ImportRulesTableColumnHeaders from "./ImportRulesTableColumnHeaders";

const meta: Meta<typeof ImportRulesTableColumnHeaders> = {
    title: "Molecules/Import Rules Table Column Headers",
    component: ImportRulesTableColumnHeaders
};

export default meta;
type Story = StoryObj<typeof ImportRulesTableColumnHeaders>;

/** The default view of `ImportRulesTableColumnHeaders`. */
export const Default: Story = {
    args: {},
    render: () => <ImportRulesTableColumnHeaders {...actions("onSortChange")} />
};
