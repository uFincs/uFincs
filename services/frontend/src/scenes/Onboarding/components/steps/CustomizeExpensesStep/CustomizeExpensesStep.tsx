import classNames from "classnames";
import {TextField} from "components/atoms";
import {Account} from "models/";
import {BaseStep} from "../..";
import "./CustomizeExpensesStep.scss";

interface CustomizeExpensesStepProps {
    /** Custom class name. */
    className?: string;
}

/** The 'Customize Expenses' step of the onboarding process. */
const CustomizeExpensesStep = ({className}: CustomizeExpensesStepProps) => (
    <BaseStep className={classNames("CustomizeExpensesStep", className)} type={Account.EXPENSE}>
        <TextField>
            Expenses are how you <strong>spend money</strong>.
            <br /> <br />
            These can range from your monthly <strong>Rent</strong> to the weeknight{" "}
            <strong>Takeout</strong> that you splurge on too often.
        </TextField>
    </BaseStep>
);

export default CustomizeExpensesStep;
