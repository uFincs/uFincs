import classNames from "classnames";
import {PageNotFoundContent} from "components/organisms";
import {DerivedAppScreenUrls} from "values/screenUrls";
import "./PageNotFoundApp.scss";

interface PageNotFoundAppProps {
    /** Custom class name. */
    className?: string;
}

/** The 404 page for when the user is logged in. */
const PageNotFoundApp = ({className}: PageNotFoundAppProps) => (
    <div className={classNames("PageNotFoundApp", className)}>
        <PageNotFoundContent
            className="PageNotFoundApp-content"
            placeThatDoesExist="dashboard"
            linkToPlaceThatDoesExist={DerivedAppScreenUrls.DASHBOARD}
        />
    </div>
);

export default PageNotFoundApp;
