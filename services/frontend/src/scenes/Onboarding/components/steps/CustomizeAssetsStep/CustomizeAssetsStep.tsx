import classNames from "classnames";
import {TextField} from "components/atoms";
import {Account} from "models/";
import {BaseStep} from "../..";
import "./CustomizeAssetsStep.scss";

interface CustomizeAssetsStepProps {
    /** Custom class name. */
    className?: string;
}

/** The 'Customize Assets' step of the onboarding process. */
const CustomizeAssetsStep = ({className}: CustomizeAssetsStepProps) => (
    <BaseStep className={classNames("CustomizeAssetsStep", className)} type={Account.ASSET}>
        <TextField>
            Assets are your <strong>resources</strong>.
            <br /> <br />
            These are things like the <strong>Chequing</strong> account at your bank or the{" "}
            <strong>Cash</strong> you have on hand.
        </TextField>
    </BaseStep>
);

export default CustomizeAssetsStep;
