import classNames from "classnames";
import {useState} from "react";
import {Investing} from "assets/graphics";
import {LogoFull} from "assets/icons";
import {OutlineButton, ShadowButton, TextField} from "components/atoms";
import {WarningMessage} from "components/molecules";
import {useNoAccount} from "hooks/";
import connect, {ConnectedProps} from "./connect";
import "./WelcomeStep.scss";

interface WelcomeStepProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** Handler for when the user wants to start the onboarding process. */
    onSubmit: () => void;
}

/** The 'first' step of the onboarding process, which welcomes the user to the app. */
const WelcomeStep = ({className, onSubmit, onUseDemoData}: WelcomeStepProps) => {
    const noAccount = useNoAccount();
    const [showNoAccount, setNoAccount] = useState(noAccount);

    return (
        <div className={classNames("WelcomeStep", className)}>
            <div className="WelcomeStep-content">
                <div className="WelcomeStep-left-half">
                    <Investing />
                </div>

                <div className="WelcomeStep-right-half">
                    <div className="WelcomeStep-right-half-content">
                        <h1 className="WelcomeStep-header">
                            Welcome to <LogoFull className="WelcomeStep-logo" aria-label="uFincs" />
                            !
                        </h1>

                        {showNoAccount ? (
                            <NoAccountLayout onNext={() => setNoAccount(false)} />
                        ) : (
                            <RegularLayout
                                noAccount={noAccount}
                                onSubmit={onSubmit}
                                onUseDemoData={onUseDemoData}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConnectedWelcomeStep = connect(WelcomeStep);
export default ConnectedWelcomeStep;

/** Other Components */

interface RegularLayoutProps {
    /** Whether or not the app is running in no-account mode. */
    noAccount: boolean;

    /** Callback for when to 'submit' the Welcome step and move to the start of the Onboarding process. */
    onSubmit: () => void;

    /** Callback for putting the user in demo data mode. */
    onUseDemoData: () => void;
}

/** This is the regular layout to show as the first step for users creating an account and the
 *  second step to users using the app without an account. */
const RegularLayout = ({noAccount, onSubmit, onUseDemoData}: RegularLayoutProps) => (
    <>
        <TextField className="WelcomeStep-body">
            uFincs uses <strong>double-entry accounting</strong>.
            <br /> <br />
            This means every transaction in uFincs belongs to <strong>two accounts</strong>.
            <br /> <br />
            For example, a transaction for getting your paycheck could belong to your
            &quot;Chequing&quot; <strong>asset account</strong> and your &quot;Salary&quot;{" "}
            <strong>income account</strong>.
            <br /> <br />
            Let&apos;s get you setup with some accounts!
        </TextField>

        <div className="WelcomeStep-buttons-container">
            <ShadowButton className="WelcomeStep-submit" onClick={onSubmit}>
                Let&apos;s go!
            </ShadowButton>

            {noAccount && (
                <>
                    <TextField>- or -</TextField>

                    <OutlineButton className="WelcomeStep-submit" onClick={onUseDemoData}>
                        Use Demo Data
                    </OutlineButton>
                </>
            )}
        </div>
    </>
);

interface NoAccountLayoutProps {
    /** Callback for moving to the `RegularLayout`. */
    onNext: () => void;
}

/** This is the layout that is the first thing shown to no-account users, to warn
 *  them of how no-account mode works. */
const NoAccountLayout = ({onNext}: NoAccountLayoutProps) => (
    <>
        <WarningMessage>
            <>
                <strong>You are using uFincs without an account.</strong>
                <br /> <br />
                All of your data will be stored <strong>locally</strong>, in your browser. If you
                logout, your data will be <strong>cleared</strong>.
                <br /> <br />
                When you decide to <strong>sign up</strong> for an account, all of your data will be{" "}
                <strong>migrated</strong> over. Or you can make a <strong>backup</strong> of your
                data in the Settings that can be <strong>restored</strong> when you use uFincs in
                the future.
                <br /> <br />
                May your dollars compound and may you <strong>
                    sign up for a full account!
                </strong>{" "}
                :)
            </>
        </WarningMessage>

        <ShadowButton className="WelcomeStep-submit" onClick={onNext}>
            Got it!
        </ShadowButton>
    </>
);
