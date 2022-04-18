import React from "react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import ImportRulesListItem from "./ImportRulesListItem";

export default {
    title: "Molecules/Import Rules List Item",
    component: ImportRulesListItem
};

/** The default view of `ImportRulesListItem`. */
export const Default = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <ImportRulesListItem id={rules[1].id} />;
});

/** The small view of `ImportRulesListItem`. */
export const Small = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <ImportRulesListItem id={rules[1].id} />;
});

Small.parameters = smallViewport;
