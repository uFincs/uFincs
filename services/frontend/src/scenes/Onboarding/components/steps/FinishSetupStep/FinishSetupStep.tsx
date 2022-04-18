import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {StepDescription} from "components/molecules";
import {AccountsList} from "components/organisms";
import {StepNavigationFooter} from "../../shared";
import connect, {ConnectedProps} from "./connect";
import "./FinishSetupStep.scss";

interface FinishSetupStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The final step of the onboarding process; shows the user a summary of the accounts
 *  that will be created for them. */
const FinishSetupStep = ({className, accountsByType, finishOnboarding}: FinishSetupStepProps) => (
    <>
        <div className={classNames("FinishSetupStep", className)}>
            <StepDescription title="Look at all your accounts!">
                <TextField>
                    Think they look good to you?
                    <br /> <br />
                    Don&apos;t worry, you can always change them later.
                </TextField>
            </StepDescription>

            <div className="FinishSetupStep-body">
                <AccountsList
                    className="FinishSetupStep-AccountsList"
                    accountsByType={accountsByType}
                    actionsToShow={[]}
                    singleLayer={false}
                    usePropData={true}
                />
            </div>
        </div>

        <StepNavigationFooter
            nextText="Finish setup!"
            skipLabel=""
            customOnNextStep={finishOnboarding}
        />
    </>
);

export default connect(FinishSetupStep);
