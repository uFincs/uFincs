import classNames from "classnames";
import * as React from "react";
import {Link as ReactRouterLink} from "react-router-dom";
import {useChildrenText} from "hooks/";
import "./Link.scss";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** Where to link to. */
    to: string;
}

/** A custom `Link` component that wraps `react-routers` `Link` in case we ever need
 *  to switch it out.
 *
 *  It also provides some extra styling, like the micro bounce!
 */
const Link = ({"aria-label": ariaLabel, className, to, children, ...otherProps}: LinkProps) => {
    const isExternal = to.includes("http");
    const label = useChildrenText(children) || ariaLabel;

    return isExternal ? (
        <a
            aria-label={ariaLabel}
            className={classNames("Link", className)}
            title={label}
            href={to}
            {...otherProps}
        >
            {children}
        </a>
    ) : (
        <ReactRouterLink
            aria-label={ariaLabel}
            className={classNames("Link", className)}
            title={label}
            to={to}
            {...otherProps}
        >
            {children}
        </ReactRouterLink>
    );
};

export default Link;
