import classNames from "classnames";
import React from "react";
import {LogoLink} from "components/molecules";
import {PageNotFoundContent} from "components/organisms";
import ScreenUrls, {MarketingUrls} from "values/screenUrls";
import "./PageNotFound.scss";

interface PageNotFoundProps {
    /** Custom class name. */
    className?: string;
}

/** The 404 page for when the user is logged out. */
const PageNotFound = ({className}: PageNotFoundProps) => (
    <div className={classNames("PageNotFound", className)}>
        <LogoLink colorTheme="light" size="small" to={MarketingUrls.LANDING} />

        <PageNotFoundContent
            className="PageNotFound-content"
            placeThatDoesExist="login page"
            linkToPlaceThatDoesExist={ScreenUrls.LOGIN}
        />
    </div>
);

export default PageNotFound;
