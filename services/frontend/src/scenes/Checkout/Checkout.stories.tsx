import React from "react";
import Checkout from "./Checkout";

export default {
    title: "Scenes/Checkout",
    component: Checkout,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

/** The default view of `Checkout`. */
export const Default = () => <Checkout />;
