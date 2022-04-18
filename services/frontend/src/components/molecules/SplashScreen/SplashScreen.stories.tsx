import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as SplashScreen} from "./SplashScreen";

export default {
    title: "Molecules/Splash Screen",
    component: SplashScreen
};

const isOpen = () => boolean("Is Open", false);

/** The default view of `SplashScreen`. */
export const Default = () => <SplashScreen isOpen={isOpen()} />;
