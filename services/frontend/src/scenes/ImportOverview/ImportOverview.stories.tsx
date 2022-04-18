import {actions} from "@storybook/addon-actions";
import React from "react";
import {storyUsingRedux, useCreateImportRules} from "utils/stories";
import {PureComponent as ImportOverview} from "./ImportOverview";

export default {
    title: "Scenes/Import Overview",
    component: ImportOverview
};

const overviewActions = actions("onAddRule");

/** The default view of `ImportOverview`. */
export const Default = storyUsingRedux(() => {
    const rules = useCreateImportRules();

    return <ImportOverview importRules={rules} {...overviewActions} />;
});
