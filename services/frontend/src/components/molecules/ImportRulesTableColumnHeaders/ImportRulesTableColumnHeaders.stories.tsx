import {actions} from "@storybook/addon-actions";
import React from "react";
import ImportRulesTableColumnHeaders from "./ImportRulesTableColumnHeaders";

export default {
    title: "Molecules/Import Rules Table Column Headers",
    component: ImportRulesTableColumnHeaders
};

const headerActions = actions("onSortChange");

/** The default view of `ImportRulesTableColumnHeaders`. */
export const Default = () => <ImportRulesTableColumnHeaders {...headerActions} />;
