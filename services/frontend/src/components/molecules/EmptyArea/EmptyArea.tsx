import classNames from "classnames";
import * as React from "react";
import {ShadowButton, TextField} from "components/atoms";
import "./EmptyArea.scss";

interface EmptyAreaProps {
    /** Custom class name. */
    className?: string;

    /** The SVG graphic component to display. */
    Graphic: React.ComponentType<{className?: string}>;

    /** The title to display. */
    title: string;

    /** The message to display. */
    message: string;

    /** The sub message to display. */
    subMessage: string;

    /** The label to display on the call-to-action button. */
    actionLabel: string;

    /** Any other (optional) content to show. */
    children?: React.ReactNode;

    /** The handler for the call-to-action button. */
    onClick: (e: React.MouseEvent) => void;
}

/** Used when an area that would normally have data, has no data.
 *
 *  Gives the user some feedback about what the area is and what they can do to make the
 *  area have data.
 */
const EmptyArea = ({
    className,
    Graphic,
    title,
    message,
    subMessage,
    actionLabel,
    children,
    onClick,
    ...otherProps
}: EmptyAreaProps) => (
    <div className={classNames("EmptyArea", className)} {...otherProps}>
        <Graphic className="EmptyArea-graphic" />

        <h2 className="EmptyArea-title">{convertNewlinesToBreaks(title)}</h2>

        <TextField className="EmptyArea-message">{message}</TextField>

        <TextField className="EmptyArea-sub-message">{subMessage}</TextField>

        <ShadowButton className="EmptyArea-button" onClick={onClick}>
            {actionLabel}
        </ShadowButton>

        {children}
    </div>
);

export default EmptyArea;

/* Helper Functions */

const convertNewlinesToBreaks = (string: string) => {
    const parts = string.split("\n");

    return parts.map((part, index) =>
        index === parts.length - 1 ? (
            <span key={part}>{part}</span>
        ) : (
            <span key={part}>
                {part}
                <br />
            </span>
        )
    );
};
