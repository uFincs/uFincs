import React from "react";
import {DateRangeProvider} from "hooks/";
import FinishSetupStep from "./FinishSetupStep";

export default {
    title: "Scenes/Onboarding/Step/Finish Setup",
    component: FinishSetupStep
};

/** The default view of `FinishSetupStep`. */
export const Default = () => (
    <DateRangeProvider>
        <FinishSetupStep />;
    </DateRangeProvider>
);
