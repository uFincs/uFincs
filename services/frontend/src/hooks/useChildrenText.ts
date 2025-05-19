import * as React from "react";

/** A hook that converts a component's string children into a single string.
 *  This is useful for, e.g., buttons to derive a `title` prop from their children/label. */
const useChildrenText = (children: React.ReactNode) => {
    let text = "";

    React.Children.map(children, (child) => {
        if (typeof child === "string") {
            text += child;
        }
    });

    return text;
};

export default useChildrenText;
