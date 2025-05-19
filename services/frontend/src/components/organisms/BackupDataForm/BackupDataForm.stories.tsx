import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as BackupDataForm} from "./BackupDataForm";

const meta: Meta<typeof BackupDataForm> = {
    title: "Organisms/Backup Data Form",
    component: BackupDataForm
};

type Story = StoryObj<typeof BackupDataForm>;

const formActions = actions("onBackup", "onEncryptedBackup");

/** The default view of `BackupDataForm`. */
export const Default: Story = {
    args: {},
    render: () => <BackupDataForm {...formActions} />
};

export default meta;
