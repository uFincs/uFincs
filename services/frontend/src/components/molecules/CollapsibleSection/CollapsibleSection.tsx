import classNames from "classnames";
import {useState} from "react";
import * as React from "react";
import {ChevronDownIcon} from "assets/icons";
import {LinkButton} from "components/atoms";
import "./CollapsibleSection.scss";

interface CollapsibleSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    /** ID is mandatory for this component, to make it accessible. */
    id: string;

    /** The label of the button that expands the section. */
    label: string;

    /** Whether the section should be open by default. */
    openByDefault?: boolean;
}

/** A section that can be shown/collapsed by clicking a button. */
const CollapsibleSection = ({
    className,
    id,
    label,
    openByDefault = false,
    children,
    ...otherProps
}: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(openByDefault);

    // Need IDs so that everything gets labelled correctly for accessibility.
    const buttonId = `${id}-button`;
    const sectionId = `${id}-section`;

    return (
        <div className={classNames("CollapsibleSection", className)} id={id} {...otherProps}>
            <LinkButton
                className="CollapsibleSection-LinkButton"
                id={buttonId}
                aria-controls={sectionId}
                aria-expanded={isOpen}
                title={label}
                onClick={() => setIsOpen((isOpen) => !isOpen)}
            >
                <span>{label}</span>

                <ChevronDownIcon
                    className={classNames("CollapsibleSection-chevron", {
                        "CollapsibleSection-chevron--open": isOpen
                    })}
                />
            </LinkButton>

            <div
                className={classNames("CollapsibleSection-section", {
                    "CollapsibleSection-section--open": isOpen
                })}
                id={sectionId}
                aria-labelledby={buttonId}
                role="region"
            >
                {children}
            </div>
        </div>
    );
};

export default CollapsibleSection;
