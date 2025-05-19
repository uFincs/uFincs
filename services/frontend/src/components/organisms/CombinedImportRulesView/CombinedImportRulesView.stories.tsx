import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import CombinedImportRulesView from "./CombinedImportRulesView";

const meta: Meta<typeof CombinedImportRulesView> = {
    title: "Organisms/Combined Import Rules View",
    component: CombinedImportRulesView
};

export default meta;
type Story = StoryObj<typeof CombinedImportRulesView>;

/** The large view of `CombinedImportRulesView`. */
export const Large: Story = {
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <CombinedImportRulesView {...args} importRules={rules} />;
    })
};

/** The small view of `CombinedImportRulesView`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <CombinedImportRulesView {...args} importRules={rules} />;
    })
};
