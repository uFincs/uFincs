import React from "react";
import {TextField} from "components/atoms";
import {Account} from "models/";
import BaseStep from "./BaseStep";

export default {
    title: "Scenes/Onboarding/Shared/Base Step",
    component: BaseStep
};

/** The default view of `CustomizeAssetsStep`. */
export const Default = () => (
    <BaseStep type={Account.ASSET}>
        <TextField>
            Assets are your <strong>resources</strong>.
            <br /> <br />
            These are things like the <strong>Chequing</strong> account at your bank or the cash you
            have on hand.
        </TextField>
    </BaseStep>
);
