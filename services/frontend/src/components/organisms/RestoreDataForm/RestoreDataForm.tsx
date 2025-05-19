import classNames from "classnames";
import {useCallback, useRef} from "react";
import * as React from "react";
import {TextField} from "components/atoms";
import {SubmitButton} from "components/molecules";
import {useOnActiveKey} from "hooks/";
import connect, {ConnectedProps} from "./connect";
import "./RestoreDataForm.scss";

interface RestoreDataFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form used in the Settings for allowing a user to restore a backup of their data. */
const RestoreDataForm = ({className, loading, onRestoreBackup}: RestoreDataFormProps) => {
    const filePickerRef = useRef<HTMLInputElement | null>(null);

    const openFilePicker = useCallback(() => filePickerRef?.current?.click(), []);
    const onKeyDown = useOnActiveKey(openFilePicker);

    const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;

        if (files?.length) {
            onRestoreBackup(files[0]);
        }
    };

    return (
        <div className={classNames("RestoreDataForm", className)}>
            <h3 className="RestoreDataForm-header">Restore your Data</h3>

            <TextField className="RestoreDataForm-TextField">
                You can <strong>restore</strong> a backup (regular or encrypted) that you previously
                created.
            </TextField>

            <input
                ref={filePickerRef}
                id="restore-data-form-file-input"
                data-testid="restore-data-form-file-input"
                type="file"
                accept=".json"
                onChange={onFileChosen}
            />

            <SubmitButton
                containerClassName="RestoreDataForm-SubmitButton-container"
                className="RestoreDataForm-SubmitButton"
                loading={loading}
                onKeyDown={onKeyDown}
            >
                <label htmlFor="restore-data-form-file-input">Restore Backup</label>
            </SubmitButton>
        </div>
    );
};

export const PureComponent = RestoreDataForm;
export const ConnectedRestoreDataForm = connect(RestoreDataForm);
export default ConnectedRestoreDataForm;
