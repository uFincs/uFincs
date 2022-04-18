import {actions} from "@storybook/addon-actions";
import React from "react";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateImportRules
} from "utils/stories";
import ImportRuleForm, {PureComponent as PureImportRuleForm} from "./ImportRuleForm";

export default {
    title: "Organisms/Import Rule Form",
    component: PureImportRuleForm
};

const formActions = actions("onClose", "onNewRule", "onSubmit");

/** The default view of `ImportRuleForm`. */
export const Default = () => {
    return (
        <PureImportRuleForm
            accountsByType={storyData.accountsByType}
            isEditing={false}
            {...formActions}
        />
    );
};

/** The small view of `ImportRuleForm`. */
export const Small = () => {
    return (
        <PureImportRuleForm
            accountsByType={storyData.accountsByType}
            isEditing={false}
            {...formActions}
        />
    );
};

Small.parameters = smallViewport;

/** The editing view of `ImportRuleForm`. */
export const Editing = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);
    const rules = useCreateImportRules();

    return (
        <PureImportRuleForm
            accountsByType={storyData.accountsByType}
            isEditing={true}
            importRuleForEditing={rules[0]}
            {...formActions}
        />
    );
});

/** The invalid editing view of `ImportRuleForm`. */
export const InvalidEditing = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);

    return (
        <PureImportRuleForm
            accountsByType={storyData.accountsByType}
            isEditing={true}
            {...formActions}
        />
    );
});

/** A story for testing that the connected `ImportRuleForm` is working. */
export const Connected = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);

    return <ImportRuleForm {...formActions} />;
});
