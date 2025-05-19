import {useEffect} from "react";
import {useHistory, useLocation} from "react-router";
import {LinkButton} from "components/atoms";
import {LogoLink} from "components/molecules";
import {AuthType} from "components/molecules/AuthForm";
import {CompleteAuthForm} from "components/organisms";
import {MarketingUrls} from "values/marketingUrls";
import ScreenUrls from "values/screenUrls";
import connect, {ConnectedProps} from "./connect";
import "./Authentication.scss";

const mapUrlToType = (url: string | undefined) => {
    switch (url) {
        case ScreenUrls.LOGIN:
            return AuthType.login;
        case ScreenUrls.SIGN_UP:
            return AuthType.signup;
        default:
            return AuthType.login;
    }
};

interface AuthenticationProps extends ConnectedProps {}

/** The forms that provide login and sign up functionality. */
const Authentication = ({
    error,
    loading,
    match,
    onLogin,
    onSignUp,
    onLoginWithoutAccount
}: AuthenticationProps) => {
    const history = useHistory();
    const location = useLocation();

    const type = mapUrlToType(match?.path);

    const onAltClick = () => {
        if (type === AuthType.login) {
            history.push(ScreenUrls.SIGN_UP);
        } else if (type === AuthType.signup) {
            history.push(ScreenUrls.LOGIN);
        }
    };

    useEffect(() => {
        // This enables users to navigate to the NO_ACCOUNT_LOGIN URL to access no-account mode
        // without having to click the button. This is useful when directing users here from the
        // Marketing site.
        if (location.pathname === ScreenUrls.NO_ACCOUNT_LOGIN) {
            onLoginWithoutAccount();
        }
    }, [location.pathname, onLoginWithoutAccount]);

    return (
        <div className="Authentication">
            <LogoLink colorTheme="light" size="small" to={MarketingUrls.LANDING} />

            <CompleteAuthForm
                error={error}
                loading={loading}
                type={type}
                onLogin={onLogin}
                onSignUp={onSignUp}
                onAltClick={onAltClick}
            />

            <LinkButton
                className="Authentication-no-account"
                disabled={loading}
                onClick={onLoginWithoutAccount}
            >
                Use without an account
            </LinkButton>
        </div>
    );
};

export const PureComponent = Authentication;
export const ConnectedAuthentication = connect(Authentication);
export default ConnectedAuthentication;
