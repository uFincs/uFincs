import classNames from "classnames";
import {TextField} from "components/atoms";
import {Account} from "models/";
import {BaseStep} from "../..";
import "./CustomizeIncomeStep.scss";

interface CustomizeIncomeStepProps {
    /** Custom class name. */
    className?: string;
}

/** The 'Customize Income' step of the onboarding process. */
const CustomizeIncomeStep = ({className}: CustomizeIncomeStepProps) => (
    <BaseStep className={classNames("CustomizeIncomeStep", className)} type={Account.INCOME}>
        <TextField>
            Income is how you <strong>make money</strong>.
            <br /> <br />
            This can be things like your <strong>Salary</strong> or the measly{" "}
            <strong>Interest</strong> you make on your savings account.
        </TextField>
    </BaseStep>
);

export default CustomizeIncomeStep;
