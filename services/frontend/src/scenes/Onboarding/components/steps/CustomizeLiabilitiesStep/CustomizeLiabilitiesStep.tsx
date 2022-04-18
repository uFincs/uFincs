import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {Account} from "models/";
import {BaseStep} from "../..";
import "./CustomizeLiabilitiesStep.scss";

interface CustomizeLiabilitiesStepProps {
    /** Custom class name. */
    className?: string;
}

/** The 'Customize Liabilities' step of the onboarding process. */
const CustomizeLiabilitiesStep = ({className}: CustomizeLiabilitiesStepProps) => (
    <BaseStep
        className={classNames("CustomizeLiabilitiesStep", className)}
        type={Account.LIABILITY}
    >
        <TextField>
            Liabilities are things you <strong>owe</strong>.
            <br /> <br />
            These are things like your <strong>Credit Card</strong> and the{" "}
            <strong>Mortgage</strong> you still have to pay off.
        </TextField>
    </BaseStep>
);

export default CustomizeLiabilitiesStep;
