import classNames from "classnames";
import React from "react";
import {CloseButton} from "components/atoms";
import "./FormCardContainer.scss";

interface FormCardContainerProps {
    /** Custom class name. */
    className?: string;

    /** The children to display in the bottom row of the card. */
    bottomRowChildren: React.ReactNode;

    /** The children to display in the top row of the card. */
    topRowChildren: React.ReactNode;

    /** Callback for removing this item. */
    onRemove: () => void;
}

/** A container that looks like a card that is used for certain form elements
 *  (e.g. Import Rule actions/conditions). */
const FormCardContainer = ({
    className,
    bottomRowChildren,
    topRowChildren,
    onRemove,
    ...otherProps
}: FormCardContainerProps) => (
    <div className={classNames("FormCardContainer", className)} {...otherProps}>
        <div className="FormCardContainer-top-row">
            {topRowChildren}

            <CloseButton
                className="FormCardContainer-close-button"
                data-testid="form-card-container-close-button"
                onDarkBackground={true}
                onClick={onRemove}
            />
        </div>

        <div className="FormCardContainer-bottom-row">{bottomRowChildren}</div>
    </div>
);

export default FormCardContainer;
