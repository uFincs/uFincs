import classNames from "classnames";
import React, {useMemo, useState} from "react";
import {animated} from "react-spring";
import {ProgressStepper} from "components/organisms";
import {useStepTransition} from "hooks/";
import {
    StepNavigationButtons,
    WelcomeStep,
    CustomizeAssetsStep,
    CustomizeExpensesStep,
    CustomizeIncomeStep,
    CustomizeLiabilitiesStep,
    FinishSetupStep
} from "./components";
import connect, {ConnectedProps} from "./connect";
import "./Onboarding.scss";

const STEP_TITLES = [
    "Customize Assets",
    "Customize Liabilities",
    "Customize Income",
    "Customize Expenses",
    "Finish Setup"
];

const STEP_COMPONENTS = [
    CustomizeAssetsStep,
    CustomizeLiabilitiesStep,
    CustomizeIncomeStep,
    CustomizeExpensesStep,
    FinishSetupStep
];

/* Component */

interface OnboardingProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The Onboarding scene. Helps the user setup their accounts. */
const Onboarding = ({className, currentStep = 0, finishOnboarding, gotoStep}: OnboardingProps) => {
    const [pastWelcomeStep, setPastWelcomeStep] = useState(false);

    const transition = useStepTransition(currentStep);

    const navButtons = useMemo(() => {
        if (currentStep === STEP_COMPONENTS.length - 1) {
            return () => (
                <StepNavigationButtons nextText="Finish" customOnNextStep={finishOnboarding} />
            );
        } else {
            return StepNavigationButtons;
        }
    }, [currentStep, finishOnboarding]);

    return (
        <div
            className={classNames(
                "Onboarding",
                {"Onboarding-WelcomeStep": !pastWelcomeStep},
                className
            )}
        >
            {pastWelcomeStep ? (
                <>
                    <ProgressStepper
                        currentStep={currentStep}
                        steps={STEP_TITLES}
                        gotoStep={gotoStep}
                        StepNavigationButtons={navButtons}
                    />

                    {transition((style, currentStep) => {
                        const Step = STEP_COMPONENTS[currentStep];

                        return (
                            <animated.div
                                className="Onboarding-step-container"
                                style={style as any}
                            >
                                <Step />
                            </animated.div>
                        );
                    })}
                </>
            ) : (
                <WelcomeStep onSubmit={() => setPastWelcomeStep(true)} />
            )}
        </div>
    );
};

export default connect(Onboarding);
