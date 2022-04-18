import classNames from "classnames";
import React, {useCallback, useState} from "react";
import {Button, LinkButton} from "components/atoms";
import {SubmitButton} from "components/molecules";
import "./StepNavigationButtons.scss";

export interface StepNavigationButtonsProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not the user can move to the next step. */
    canMoveToNextStep?: boolean;

    /** Whether or not to hide the back button.
     *  The back button should normally be hidden on the first step,
     *  since there's nothing to go back to yet. */
    hideBackButton?: boolean;

    /** Whether or not the 'Next' button should show a loading state. */
    loading?: boolean;

    /** A tooltip to display to explain why the Next button is disabled
     *  (i.e. what the user has to do to complete the current step). */
    nextDisabledReason?: string;

    /** Overrides the text of the 'Next' button. */
    nextText?: string;

    /** Handler for moving to the next step. */
    onNextStep: () => void;

    /** Handler for moving to the previous step. */
    onPreviousStep: () => void;

    /** Handler for moving to the next step.
     *
     *  Can be passed in as an OwnProp to override the connected prop and be controlled
     *  by the Step directly. */
    customOnNextStep?: () => void;

    /** A custom handler for when clicking on the Next button while it's disabled.  */
    disabledOnNextStep?: () => void;
}

/** The Back/Next buttons used for navigating between steps of the Transactions Import process. */
const StepNavigationButtons = ({
    className,
    canMoveToNextStep = false,
    hideBackButton = false,
    loading = false,
    nextDisabledReason = "",
    nextText = "Next",
    onNextStep,
    onPreviousStep,
    disabledOnNextStep
}: StepNavigationButtonsProps) => {
    const [showDisabledReason, setShowDisabledReason] = useState(false);

    const disabledOnClick = useCallback(() => {
        setShowDisabledReason(true);
        disabledOnNextStep?.();
    }, [disabledOnNextStep, setShowDisabledReason]);

    const reasonOnClick = useCallback(() => setShowDisabledReason(false), [setShowDisabledReason]);

    return (
        <div className={classNames("StepNavigationButtons", className)}>
            {!canMoveToNextStep && nextDisabledReason && showDisabledReason && (
                <p className="StepNavigationButtons-next-disabled-reason" onClick={reasonOnClick}>
                    {nextDisabledReason}
                </p>
            )}

            <div className="StepNavigationButtons-buttons-container">
                {!hideBackButton && (
                    <LinkButton
                        className="StepNavigationButtons-back"
                        data-testid="step-navigation-back-button"
                        disabled={loading}
                        onClick={onPreviousStep}
                    >
                        Back
                    </LinkButton>
                )}

                <SubmitButton
                    containerClassName="StepNavigationButtons-next"
                    data-testid="step-navigation-next-button"
                    Button={Button}
                    disabled={!canMoveToNextStep}
                    loading={loading}
                    title={!canMoveToNextStep ? nextDisabledReason : ""}
                    onClick={onNextStep}
                    disabledOnClick={disabledOnClick}
                >
                    {nextText}
                </SubmitButton>
            </div>
        </div>
    );
};

export default StepNavigationButtons;
