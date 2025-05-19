import classNames from "classnames";
import {useCallback, useEffect, useRef, useState} from "react";
import * as React from "react";
import {TextField} from "components/atoms";
import {StepDescription, SubmitButton} from "components/molecules";
import {useOnActiveKey} from "hooks/";
import {StepNavigationFooter} from "../..";
import connect, {ConnectedProps} from "./connect";
import "./ChooseFileStep.scss";

interface ChooseFileStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The second step of the Transactions Import process, the Choose File step is where
 *  the user chooses the file that they'll be importing transactions from. */
const ChooseFileStep = ({
    className,
    fileName,
    possibleTransactionsCount = 0,
    parseFile
}: ChooseFileStepProps) => {
    const [loading, setLoading] = useState(false);
    const filePickerRef = useRef<HTMLInputElement | null>(null);

    const openFilePicker = useCallback(() => filePickerRef?.current?.click(), []);
    const onKeyDown = useOnActiveKey(openFilePicker);

    const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;

        if (files?.length) {
            setLoading(true);
            parseFile(files[0]);
        }
    };

    useEffect(() => {
        // TECH DEBT: Given how this interacts with the store state, if a user were to pick a file
        // in this step, move forward a step, but then move back to this step and choose the same file,
        // because the fileName doesn't change, the effect doesn't get triggered to stop the loading
        // state.
        //
        // An uncommon bug, for sure, but one that has now been noted.
        if (fileName && loading) {
            setLoading(false);
        }

        // We deliberately only want this to fire when _only_ the fileName changes, and not when loading
        // changes. Otherwise, setting loading while a fileName already exists will cause the loading
        // state to be immediately turned off.
        // eslint-disable-next-line
    }, [fileName]);

    return (
        <>
            <div className={classNames("ChooseFileStep", className)}>
                <StepDescription title="Where are your transactions coming from?">
                    <TextField>
                        Now you can choose the <strong>CSV file</strong> to{" "}
                        <strong>import from.</strong>
                        <br /> <br />
                        It will need columns for at least the following: <br />
                        <strong>Account, Amount, Date</strong> and <strong>Description</strong>
                    </TextField>
                </StepDescription>

                <div className="ChooseFileStep-body">
                    <div className="ChooseFileStep-file-picker">
                        {/* This combination of a label and file input is a 'hack' to be able to
                            style file picker inputs.
                            See this for reference: https://benmarshall.me/styling-file-inputs/ */}
                        <input
                            ref={filePickerRef}
                            id="transactions-import-file-input"
                            data-testid="choose-file-step-file-input"
                            type="file"
                            accept=".csv"
                            onChange={onFileChosen}
                        />

                        <SubmitButton
                            containerClassName="ChooseFileStep-button-container"
                            className="ChooseFileStep-button"
                            loading={loading}
                            onKeyDown={onKeyDown}
                        >
                            <label htmlFor="transactions-import-file-input">Choose File</label>
                        </SubmitButton>

                        <TextField className="ChooseFileStep-file-name">
                            {fileName ? fileName : "No file chosen"}
                        </TextField>
                    </div>

                    {fileName && possibleTransactionsCount && (
                        <TextField className="ChooseFileStep-status-message">
                            <strong>Success!</strong> Looks like we found{" "}
                            <strong>{possibleTransactionsCount}</strong> possible transactions.
                        </TextField>
                    )}
                </div>
            </div>

            <StepNavigationFooter />
        </>
    );
};

const ConnectedChooseFileStep = connect(ChooseFileStep);
export default ConnectedChooseFileStep;
