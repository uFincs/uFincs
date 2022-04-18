import classNames from "classnames";
import React from "react";
import {Link, Logo} from "components/atoms";
import {LinkProps} from "components/atoms/Link";
import {LogoProps} from "components/atoms/Logo";
import "./LogoLink.scss";

interface LogoLinkProps extends Omit<LinkProps, "children">, LogoProps {}

/** The `Logo` that has been wrapped with a `Link`. Since `Logo`s are rarely used
 *  just for presentation purposes, it makes sense to have a version that can be used as a link.
 */
const LogoLink = ({className, to, colorTheme, size, variant, ...otherProps}: LogoLinkProps) => (
    <Link className={classNames("LogoLink", className)} to={to} {...otherProps}>
        <Logo colorTheme={colorTheme} size={size} variant={variant} />
    </Link>
);

export default LogoLink;
