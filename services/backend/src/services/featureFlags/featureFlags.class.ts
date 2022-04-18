import {ServiceMethods} from "@feathersjs/feathers";
import {FeatureFlagsConfig} from "types";
import {Application} from "../../declarations";

interface Data {}
interface ServiceOptions {}

export class FeatureFlags implements Pick<ServiceMethods<Data>, "find"> {
    app: Application;
    options: ServiceOptions;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.app = app;
        this.options = options;
    }

    async find(): Promise<FeatureFlagsConfig> {
        return this.app.get("featureFlags");
    }
}
