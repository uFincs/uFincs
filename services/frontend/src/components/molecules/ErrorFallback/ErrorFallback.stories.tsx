import React from "react";
import ErrorFallback from "./ErrorFallback";

export default {
    title: "Molecules/Error Fallback",
    component: ErrorFallback
};

/** The default view of `ErrorFallback`. */
export const Default = () => <ErrorFallback error={new Error("oops")} />;
