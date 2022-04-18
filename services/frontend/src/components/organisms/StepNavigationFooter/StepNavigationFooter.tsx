import classNames from "classnames";
import React from "react";
import {Divider, LinkButton} from "components/atoms";
import {StepNavigationButtons} from "components/molecules";
import {StepNavigationButtonsProps} from "components/molecules/StepNavigationButtons/StepNavigationButtons";
import "./StepNavigationFooter.scss";

interface StepNavigationFooterProps extends StepNavigationButtonsProps {
    /** Custom class name. */
    className?: string;

    /** The label for the 'skip' button.
     *
     *  If not provided, then no skip button is shown. */
    skipLabel?: string;

    /** Handler for the skip button. */
    onSkip?: () => void;
}

/** The footer that goes beneath every step of, e.g. the Transactions Import process to
 *  allow the user to navigate between steps. */
const StepNavigationFooter = ({
    className,
    skipLabel,
    onSkip,
    ...otherProps
}: StepNavigationFooterProps) => (
    <div
        className={classNames("StepNavigationFooter", className)}
        data-testid="step-navigation-footer"
    >
        <Divider />

        <div className="StepNavigationFooter-body">
            {skipLabel && <LinkButton onClick={onSkip}>{skipLabel}</LinkButton>}

            <StepNavigationButtons {...otherProps} />
        </div>
    </div>
);

export default StepNavigationFooter;
