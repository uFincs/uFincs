import classNames from "classnames";
import {useMemo} from "react";
import * as React from "react";
import {Divider} from "components/atoms";
import {ProgressStep} from "components/molecules";
import "./ProgressStepper.scss";

interface ProgressStepperProps {
    /** Custom class name. */
    className?: string;

    /** The index of the current step. */
    currentStep: number;

    /** The set of step titles. */
    steps: Array<string>;

    /** The component to use for the step navigation buttons.
     *
     *  Needs to be passed in since these buttons are connected to the store differently
     *  for each process. */
    StepNavigationButtons: React.ComponentType<any>;

    /** Handler for jumping directly to a step.
     *  Used when clicking on a (completed) step on desktop. */
    gotoStep: (step: number) => void;
}

/** A stepper used to show the progress over things like the Transactions Import process. */
const ProgressStepper = (props: ProgressStepperProps) => (
    <div className="ProgressStepper">
        <DesktopProgressStepper {...props} />
        <MobileProgressStepper {...props} />
    </div>
);

export default ProgressStepper;

/* Other Components */

const DesktopProgressStepper = ({
    className,
    currentStep = 0,
    steps,
    gotoStep
}: ProgressStepperProps) => {
    const stepComponents = useMemo(
        () =>
            steps.map((label, index) => (
                <React.Fragment key={label}>
                    <ProgressStep
                        isCompleted={index < currentStep}
                        isCurrentStep={index === currentStep}
                        label={label}
                        step={index + 1}
                        onClick={() => gotoStep(index)}
                    />

                    {/* Don't want a divider after the last step. */}
                    {index !== steps.length - 1 && (
                        <Divider
                            className={classNames("DesktopProgressStepper-Divider", {
                                "DesktopProgressStepper-Divider--highlighted": index < currentStep
                            })}
                        />
                    )}
                </React.Fragment>
            )),
        [currentStep, steps, gotoStep]
    );

    return <div className={classNames("DesktopProgressStepper", className)}>{stepComponents}</div>;
};

const MobileProgressStepper = ({
    className,
    currentStep = 0,
    steps,
    StepNavigationButtons
}: ProgressStepperProps) => {
    const nextStepLabel =
        currentStep === steps.length - 1 ? "Almost done!" : steps[currentStep + 1];

    return (
        <div
            className={classNames("MobileProgressStepper", className)}
            data-testid="mobile-progress-stepper"
        >
            <MobileStepIndicator step={currentStep} totalSteps={steps.length} />

            <div className="MobileProgressStepper-header">
                <h2 className="MobileProgressStepper-current-step">{steps[currentStep]}</h2>
                <h3 className="MobileProgressStepper-next-step">Next: {nextStepLabel}</h3>
            </div>

            <StepNavigationButtons />
        </div>
    );
};

interface MobileStepIndicatorProps {
    step: number;
    totalSteps: number;
}

const MobileStepIndicator = ({step, totalSteps}: MobileStepIndicatorProps) => {
    const val = ((step + 1) / totalSteps) * 100;

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = ((100 - val) / 100) * circumference;

    return (
        <div className="MobileStepIndicator">
            <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                    className="inner-circle"
                    r={radius}
                    cx="100"
                    cy="100"
                    fill="transparent"
                    strokeDasharray="565.48"
                    strokeDashoffset="0"
                />

                <circle
                    className="progress-circle"
                    r={radius}
                    cx="100"
                    cy="100"
                    fill="transparent"
                    strokeDasharray="565.48"
                    strokeDashoffset={dashOffset}
                />
            </svg>

            <p className="MobileStepIndicator-label">
                {step + 1} of {totalSteps}
            </p>
        </div>
    );
};
