import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import {PureComponent as PureImportRulesList} from "./ImportRulesList";

const meta: Meta<typeof PureImportRulesList> = {
    title: "Organisms/Import Rules List",
    component: PureImportRulesList
};

export default meta;
type Story = StoryObj<typeof PureImportRulesList>;

/** The default view of `ImportRulesList`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();

        return <PureImportRulesList importRules={rules} {...args} />;
    })
};

/** The empty view of `ImportRulesList`. */
export const Empty: Story = {
    render: storyUsingRedux((args) => {
        return <PureImportRulesList importRules={[]} {...args} />;
    })
};

/** The small view of the `TransactionsList`. */
export const Small: Story = {
    render: storyUsingRedux((args) => {
        const rules = useCreateImportRules();
        return <PureImportRulesList importRules={rules} {...args} />;
    }),
    parameters: {
        ...smallViewport
    }
};
