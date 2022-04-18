import React from "react";
import {smallViewport, storyUsingRedux, useCreateImportRules} from "utils/stories";
import CombinedImportRulesView from "./CombinedImportRulesView";

export default {
    title: "Organisms/Combined Import Rules View",
    component: CombinedImportRulesView
};

/** The large view of `CombinedImportRulesView`. */
export const Large = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <CombinedImportRulesView importRules={rules} />;
});

/** The small view of `CombinedImportRulesView`. */
export const Small = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <CombinedImportRulesView importRules={rules} />;
});

Small.parameters = smallViewport;
