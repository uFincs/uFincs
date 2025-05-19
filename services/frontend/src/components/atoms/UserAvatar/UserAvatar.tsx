import classNames from "classnames";
import * as React from "react";
import {ChevronDownIcon, UserIcon} from "assets/icons";
import "./UserAvatar.scss";

interface UserAvatarProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/** An avatar that can be used as the button for the user settings menu. */
const UserAvatar = React.forwardRef(
    ({className, ...otherProps}: UserAvatarProps, ref: React.Ref<HTMLButtonElement>) => (
        <button
            className={classNames("UserAvatar", className)}
            ref={ref}
            title="User Settings"
            {...otherProps}
        >
            <div className="UserAvatar-user-icon-container">
                <UserIcon className="UserAvatar-user-icon" />
            </div>

            <ChevronDownIcon className="UserAvatar-chevron-icon" />
        </button>
    )
);

export default UserAvatar;
