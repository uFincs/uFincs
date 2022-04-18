import React from "react";
import AnimatedLogo from "./AnimatedLogo";

export default {
    title: "Atoms/Animated Logo",
    component: AnimatedLogo
};

/** The default view of `AnimatedLogo`. */
export const Default = () => <AnimatedLogo />;

/** An example of `AnimatedLogo` scaled up in size. */
export const Large = () => <AnimatedLogo className="AnimatedLogo--story-Large" />;
