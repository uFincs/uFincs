import React from "react";
import {storyUsingRedux, useCreateImportRules} from "utils/stories";
import ImportRulesTable from "./ImportRulesTable";

export default {
    title: "Organisms/Import Rules Table",
    component: ImportRulesTable
};

/** The default view of `ImportRulesTable`. */
export const Default = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <ImportRulesTable importRules={rules} />;
});

/** The empty view of the `ImportRulesTable`. */
export const Empty = storyUsingRedux(() => {
    useCreateImportRules([]);

    return <ImportRulesTable importRules={[]} />;
});
