import classNames from "classnames";
import React from "react";
import {RefreshIcon} from "assets/icons";
import {IconButton} from "components/atoms";
import {IconButtonProps} from "components/atoms/IconButton";
import {NativePlatformsService} from "services/";
import connect from "./connect";
import "./AppRefreshButton.scss";

interface AppRefreshButtonProps extends IconButtonProps {}

/** Button for performing a manual 'refresh' (ala browser refresh) for the app
 *  to pull in the latest data from the Backend.
 *
 *  Useful for the native apps that don't _have_ a browser refresh. */
const AppRefreshButton = ({className, ...otherProps}: AppRefreshButtonProps) =>
    NativePlatformsService.isMobilePlatform() ? (
        <IconButton
            className={classNames("AppRefreshButton", className)}
            title="Refresh"
            {...otherProps}
        >
            <RefreshIcon />
        </IconButton>
    ) : null;

export const PureComponent = AppRefreshButton;
export default connect(AppRefreshButton);
