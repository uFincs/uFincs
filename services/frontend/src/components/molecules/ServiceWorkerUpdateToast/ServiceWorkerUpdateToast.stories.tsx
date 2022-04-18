import {actions} from "@storybook/addon-actions";
import React from "react";
import ServiceWorkerUpdateToast from "./ServiceWorkerUpdateToast";

export default {
    title: "Molecules/Service Worker Update Toast",
    component: ServiceWorkerUpdateToast
};

const toastActions = actions("onClose", "onUpdate");

/** The default view of `ServiceWorkerUpdateToast`. */
export const Default = () => (
    <ServiceWorkerUpdateToast message="A new version is available" {...toastActions} />
);
