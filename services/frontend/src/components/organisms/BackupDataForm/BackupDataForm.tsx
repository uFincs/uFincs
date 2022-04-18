import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {SubmitButton} from "components/molecules";
import {useNoAccount} from "hooks/";
import connect, {ConnectedProps} from "./connect";
import "./BackupDataForm.scss";

interface BackupDataFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form used in the Settings for allowing a user to backup their data. */
const BackupDataForm = ({className, onBackup, onEncryptedBackup}: BackupDataFormProps) => {
    const noAccount = useNoAccount();

    return (
        <div className={classNames("BackupDataForm", className)}>
            <h3 className="BackupDataForm-header">Backup your Data</h3>

            <TextField className="BackupDataForm-TextField">
                You can <strong>backup</strong> your data to restore it later.
                <br /> <br />
                <strong>Regular backup</strong> files <strong>aren&apos;t encrypted</strong>; you
                can use them to restore your data to <strong>this or any other</strong> uFincs
                account, or to take your data with you to another service.
                {!noAccount && (
                    <>
                        <br /> <br />
                        <strong>Encrypted backup</strong> files can only be restored to{" "}
                        <strong>this</strong> uFincs account; they cannot be restored to another
                        account nor can they be restored if you{" "}
                        <strong>change your password</strong>.
                    </>
                )}
            </TextField>

            <div className="BackupDataForm-buttons">
                <SubmitButton
                    containerClassName="BackupDataForm-SubmitButton"
                    data-testid="backup-data-form-backup"
                    onClick={onBackup}
                >
                    Download Regular Backup
                </SubmitButton>

                {!noAccount && (
                    <SubmitButton
                        containerClassName="BackupDataForm-SubmitButton"
                        data-testid="backup-data-form-encrypted-backup"
                        onClick={onEncryptedBackup}
                    >
                        Download Encrypted Backup
                    </SubmitButton>
                )}
            </div>
        </div>
    );
};

export const PureComponent = BackupDataForm;
export default connect(BackupDataForm);
