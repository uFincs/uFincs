import classNames from "classnames";
import {useMemo} from "react";
import {animated} from "react-spring";
import {BackButton, OverlineHeading} from "components/atoms";
import {ProgressStepper} from "components/organisms";
import {useScrollToTopOn, useStepTransition} from "hooks/";
import {
    StepNavigationButtons,
    AdjustTransactionsStep,
    ChooseAccountStep,
    ChooseFileStep,
    MapCsvStep,
    SummaryStep
} from "./components";
import connect, {ConnectedProps} from "./connect";
import "./TransactionsImport.scss";

const STEP_TITLES = [
    "Choose Account",
    "Choose CSV File",
    "Match CSV Columns",
    "Adjust Transactions",
    "Finish Import"
];

const STEP_COMPONENTS = [
    ChooseAccountStep,
    ChooseFileStep,
    MapCsvStep,
    AdjustTransactionsStep,
    SummaryStep
];

interface TransactionsImportProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The scene for importing transactions. */
const TransactionsImport = ({
    className,
    currentStep = 0,
    gotoStep,
    onBack
}: TransactionsImportProps) => {
    useScrollToTopOn(currentStep);

    const transition = useStepTransition(currentStep);

    const navButtons = useMemo(
        () => () => <StepNavigationButtons useShortNextText={true} />,
        // Forcibly cache bust when the step changes. This way, if the user opened the disabled reason
        // error message, the open state will be cleared between states. AKA, hacky.
        // eslint-disable-next-line
        [currentStep]
    );

    return (
        <div className={classNames("TransactionsImport", className)}>
            <div className="TransactionsImport-header">
                <BackButton onClick={onBack} />
                <OverlineHeading>Import Transactions</OverlineHeading>
            </div>

            <ProgressStepper
                currentStep={currentStep}
                steps={STEP_TITLES}
                gotoStep={gotoStep}
                StepNavigationButtons={navButtons}
            />

            {transition((style, currentStep) => {
                const Step = STEP_COMPONENTS[currentStep];

                return (
                    // @ts-expect-error Missing children prop: https://github.com/pmndrs/react-spring/issues/2358
                    <animated.div
                        className="TransactionsImport-step-container"
                        style={style as any}
                    >
                        <Step />
                    </animated.div>
                );
            })}
        </div>
    );
};

export const PureComponent = TransactionsImport;
const ConnectedTransactionsImport = connect(TransactionsImport);
export default ConnectedTransactionsImport;
