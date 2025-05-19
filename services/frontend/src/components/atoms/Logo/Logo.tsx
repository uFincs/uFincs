import classNames from "classnames";
import {LogoFull, LogoStandalone} from "assets/icons";
import "./Logo.scss";

export interface LogoProps {
    /** Custom class name. */
    className?: string;

    /** Which color theme to use. Can be `dark` or `light`. */
    colorTheme?: "dark" | "light";

    /** Size of the logo. Can be `large` or `small`. */
    size?: "large" | "small";

    /** Which version of the logo to display. Can be `full` or `standalone`. */
    variant?: "full" | "standalone";
}

/** The app's logo. Can be displayed as either the full word or just the first letter. */
const Logo = ({className, colorTheme = "dark", size = "large", variant = "full"}: LogoProps) => {
    const finalClassName = classNames(
        "Logo",
        `Logo--${colorTheme}`,
        `Logo--${size}`,
        `Logo--${variant}`,
        className
    );

    switch (variant) {
        case "full":
            return <LogoFull className={finalClassName} title="uFincs" />;
        case "standalone":
            return <LogoStandalone className={finalClassName} title="uFincs" />;
        default:
            return <LogoFull className={finalClassName} title="uFincs" />;
    }
};

export default Logo;
