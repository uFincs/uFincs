import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as RestoreDataForm} from "./RestoreDataForm";

export default {
    title: "Organisms/Restore Data Form",
    component: RestoreDataForm
};

const formActions = actions("onRestoreBackup");

/** The default view of `RestoreDataForm`. */
export const Default = () => <RestoreDataForm {...formActions} />;
