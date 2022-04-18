import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as BackupDataForm} from "./BackupDataForm";

export default {
    title: "Organisms/Backup Data Form",
    component: BackupDataForm
};

const formActions = actions("onBackup", "onEncryptedBackup");

/** The default view of `BackupDataForm`. */
export const Default = () => <BackupDataForm {...formActions} />;
