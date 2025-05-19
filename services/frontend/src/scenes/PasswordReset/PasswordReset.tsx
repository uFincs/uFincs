import {LogoLink} from "components/molecules";
import {PasswordResetForm} from "components/organisms";
import {MarketingUrls} from "values/marketingUrls";
import "./PasswordReset.scss";

/** Scene for the form that sends a user a password reset link. */
const PasswordReset = () => (
    <div className="PasswordReset">
        <LogoLink colorTheme="light" size="small" to={MarketingUrls.LANDING} />

        <PasswordResetForm />
    </div>
);

export default PasswordReset;
