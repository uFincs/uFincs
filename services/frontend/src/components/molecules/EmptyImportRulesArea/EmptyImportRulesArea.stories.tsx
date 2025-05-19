import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import EmptyImportRulesArea from "./EmptyImportRulesArea";

const meta: Meta<typeof EmptyImportRulesArea> = {
    title: "Molecules/Empty Import Rules Area",
    component: EmptyImportRulesArea
};

export default meta;
type Story = StoryObj<typeof EmptyImportRulesArea>;

const areaActions = actions("onAddRule");

/** The default view of the `EmptyImportRulesArea`. */
export const Default: Story = {
    args: {},
    render: () => <EmptyImportRulesArea {...areaActions} />
};
