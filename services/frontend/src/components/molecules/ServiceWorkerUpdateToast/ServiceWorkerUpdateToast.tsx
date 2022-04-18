import React from "react";
import {SmallToast} from "components/molecules";
import "./ServiceWorkerUpdateToast.scss";

interface ServiceWorkerUpdateToastProps {
    /** Message to display. */
    message: string;

    /** Handler for closing the toast. */
    onClose: () => void;

    /** Handler for triggering an update. */
    onUpdate: () => void;
}

/** A `ServiceWorkerUpdateToast  is a `SmallToast` that has the action bound to 'Update'. */
const ServiceWorkerUpdateToast = ({
    message,
    onClose,
    onUpdate,
    ...otherProps
}: ServiceWorkerUpdateToastProps) => (
    <SmallToast
        actionLabel="Update"
        message={message}
        onAction={onUpdate}
        onClose={onClose}
        {...otherProps}
    />
);

export default ServiceWorkerUpdateToast;
