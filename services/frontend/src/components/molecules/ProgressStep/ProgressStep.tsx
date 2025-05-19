import classNames from "classnames";
import {CheckIcon} from "assets/icons";
import {TextField} from "components/atoms";
import {useOnActiveKey} from "hooks/";
import "./ProgressStep.scss";

interface ProgressStepProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not the step has been completed already.
     *  Takes precedence if both `isCompleted` and `isCurrentStep` are somehow set to true. */
    isCompleted?: boolean;

    /** Whether or not the step is the current step. */
    isCurrentStep?: boolean;

    /** The name of this step. */
    label: string;

    /** The number of this step. */
    step: number;

    /** Handler when clicking on the step. */
    onClick: () => void;
}

/** A single step of the `ProgressStepper`.
 *  Can be an upcoming step, the current step, or a completed step. */
const ProgressStep = ({
    className,
    isCompleted = false,
    isCurrentStep = false,
    label,
    step,
    onClick
}: ProgressStepProps) => {
    const labelState = isCompleted ? "(completed)" : isCurrentStep ? "(current)" : "";
    const title = `Step ${step}: ${label} ${labelState}`;

    const onKeyDown = useOnActiveKey(onClick);

    return (
        <div
            className={classNames(
                "ProgressStep",
                {
                    "ProgressStep--current-step": isCurrentStep,
                    "ProgressStep--completed": isCompleted
                },
                className
            )}
            aria-label={title}
            // Enable vimium clickability.
            role="button"
            title={title}
            tabIndex={isCompleted ? 0 : -1}
            onClick={onClick}
            onKeyDown={onKeyDown}
        >
            <div className="ProgressStep-circle">{isCompleted ? <CheckIcon /> : step}</div>

            <TextField className="ProgressStep-label">{label}</TextField>
        </div>
    );
};

export default ProgressStep;
