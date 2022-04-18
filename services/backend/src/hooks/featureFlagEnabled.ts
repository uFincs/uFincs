import {HookContext} from "@feathersjs/feathers";
import {FeatureFlagName} from "types";

const featureFlagEnabled = (flag: FeatureFlagName) => async (context: HookContext) => {
    const flags = await context.app.service("featureFlags").find();

    return !!flags[flag];
};

export default featureFlagEnabled;
