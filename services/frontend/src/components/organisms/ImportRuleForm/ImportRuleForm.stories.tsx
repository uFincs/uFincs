import type {Meta, StoryObj} from "@storybook/react";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateImportRules
} from "utils/stories";
import ImportRuleForm, {PureComponent as PureImportRuleForm} from "./ImportRuleForm";

const meta: Meta<typeof PureImportRuleForm> = {
    title: "Organisms/Import Rule Form",
    component: PureImportRuleForm,
    args: {
        isEditing: false,
        accountsByType: storyData.accountsByType
    }
};

export default meta;
type Story = StoryObj<typeof PureImportRuleForm>;

/** The default view of `ImportRuleForm`. */
export const Default: Story = {};

/** The small view of `ImportRuleForm`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The editing view of `ImportRuleForm`. */
export const Editing: Story = {
    args: {
        isEditing: true
    },
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);
        const rules = useCreateImportRules();

        return <PureImportRuleForm importRuleForEditing={rules[0]} {...args} />;
    })
};

/** The invalid editing view of `ImportRuleForm`. */
export const InvalidEditing: Story = {
    args: {
        isEditing: true
    },
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);

        return <PureImportRuleForm {...args} />;
    })
};

/** A story for testing that the connected `ImportRuleForm` is working. */
export const Connected: Story = {
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);

        return <ImportRuleForm {...args} />;
    })
};
