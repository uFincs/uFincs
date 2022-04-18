import React from "react";
import {LogoLink} from "components/molecules";
import {SendPasswordResetForm} from "components/organisms";
import {MarketingUrls} from "values/screenUrls";
import "./SendPasswordReset.scss";

/** Scene for the form that sends a user a password reset link. */
const SendPasswordReset = () => (
    <div className="SendPasswordReset">
        <LogoLink colorTheme="light" size="small" to={MarketingUrls.LANDING} />

        <SendPasswordResetForm />
    </div>
);

export default SendPasswordReset;
