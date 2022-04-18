import classNames from "classnames";
import React from "react";
import "./LoadingSpinner.scss";

interface LoadingSpinnerProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not the loading spinner should be visible and spinning. */
    loading?: boolean;
}

/** A spinner for indicating a loading state.
 *
 *  **Note**: Its parent container must have `position: relative` to work correctly.
 */
const LoadingSpinner = ({className, loading}: LoadingSpinnerProps) => (
    <div
        className={classNames("LoadingSpinner", {"LoadingSpinner--visible": loading}, className)}
        title="Loading"
    />
);

export default LoadingSpinner;
