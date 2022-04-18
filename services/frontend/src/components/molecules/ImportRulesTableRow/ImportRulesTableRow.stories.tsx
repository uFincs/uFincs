import React from "react";
import {storyUsingRedux, useCreateImportRules} from "utils/stories";
import ImportRulesTableRow from "./ImportRulesTableRow";

export default {
    title: "Molecules/Import Rules Table Row",
    component: ImportRulesTableRow
};

/** The default view of `ImportRulesTableRow`. */
export const Default = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <ImportRulesTableRow id={rules[1].id} />;
});
