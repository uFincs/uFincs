import classNames from "classnames";
import {useCallback, useEffect, useRef, useState} from "react";
import * as React from "react";
import {TextField} from "components/atoms";
import {LabelledSelectInput} from "components/molecules";
import {CurrencyOptions} from "values/currencies";
import connect, {ConnectedProps} from "./connect";
import "./CurrencyPreferenceForm.scss";

interface CurrencyPreferenceFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form used in the Settings for allowing a user to backup their data. */
const CurrencyPreferenceForm = ({
    className,
    currentCurrency,
    error = "",
    loading = false,
    onSave
}: CurrencyPreferenceFormProps) => {
    const firstRender = useRef(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (firstRender.current) {
            // Don't want to show the success indicator on the first render.
            firstRender.current = false;
        } else if (!loading && !error) {
            setShowSuccess(true);
        } else if (error) {
            setShowSuccess(false);
        }
    }, [error, loading]);

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setShowSuccess(false);

            const value = e.target.value;

            // Want a short timeout so that the success indicator has enough time to animate out
            // before animating back in again for another change.
            setTimeout(() => {
                onSave(value);
            }, 250);
        },
        [onSave]
    );

    return (
        <div className={classNames("CurrencyPreferenceForm", className)}>
            <h3 className="CurrencyPreferenceForm-header">Currency</h3>

            <TextField className="CurrencyPreferenceForm-TextField">
                Select which currency to display for all monetary amounts across the app.
            </TextField>

            <LabelledSelectInput
                containerClassName="CurrencyPreferenceForm-SelectInput"
                data-testid="currency-preference-form-input"
                aria-label="Currency"
                label=""
                title="Currency"
                hasStatusState={true}
                error={error}
                showSuccess={showSuccess}
                value={currentCurrency}
                values={CurrencyOptions}
                onChange={onChange}
            />
        </div>
    );
};

export const PureComponent = CurrencyPreferenceForm;
export const ConnectedCurrencyPreferenceForm = connect(CurrencyPreferenceForm);
export default ConnectedCurrencyPreferenceForm;
