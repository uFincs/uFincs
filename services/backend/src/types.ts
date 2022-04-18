import {Model, ModelCtor} from "sequelize";

export interface Models {
    [key: string]: ModelCtor<Model<any, any>>;
}

export type FeatureFlagName = "subscriptions";
export type FeatureFlagsConfig = Record<FeatureFlagName, boolean>;
