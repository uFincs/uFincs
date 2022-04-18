import classNames from "classnames";
import React from "react";
import {SuccessIcon} from "assets/icons";
import {Logo, TextField} from "components/atoms";
import {AuthForm, LogoLink} from "components/molecules";
import {AuthType} from "components/molecules/AuthForm";
import ScreenUrls from "values/screenUrls";
import connect, {ConnectedProps} from "./connect";
import "./NoAccountSignUp.scss";

interface NoAccountSignUpProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The scene that provides in-app sign up for no-account users. */
const NoAccountSignUp = ({className, error, loading, onSignUp}: NoAccountSignUpProps) => (
    <div className={classNames("NoAccountSignUp", className)}>
        <LogoLink colorTheme="light" size="small" to={ScreenUrls.APP} />

        <div className="NoAccountSignUp-content">
            <div className="NoAccountSignUp-message">
                <h1 className="NoAccountSignUp-header">
                    A <Logo size="small" /> account gets you:
                </h1>

                <ul className="NoAccountSignUp-features-list">
                    <MessageListItem>
                        Access to your data on <strong>all your devices</strong>
                    </MessageListItem>

                    <MessageListItem>
                        The <strong>removal</strong> of the annoying &apos;Sign Up&apos; button
                    </MessageListItem>

                    <MessageListItem>
                        All the <strong>great features</strong> of uFincs that you could already use
                        without an account
                    </MessageListItem>

                    <MessageListItem>
                        <strong>Encrypted</strong> backups
                    </MessageListItem>

                    <MessageListItem>
                        That <strong>warm feeling</strong> knowing you&apos;re supporting a solo
                        developer :)
                    </MessageListItem>
                </ul>
            </div>

            <AuthForm error={error} loading={loading} type={AuthType.signup} onSubmit={onSignUp} />
        </div>
    </div>
);

export const PureComponent = NoAccountSignUp;
export default connect(NoAccountSignUp);

/* Other Components */

interface MessageListItemProps {
    /** The text content to display in the list item. */
    children: React.ReactNode;
}

/** Just a small component to encapsulate the styles/icon of the list items. */
const MessageListItem = ({children}: MessageListItemProps) => (
    <li className="MessageListItem">
        <SuccessIcon />

        <TextField>{children}</TextField>
    </li>
);
