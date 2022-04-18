import pg from "pg";
import {Sequelize} from "sequelize";
import {Application} from "declarations";
import {ENV} from "values/servicesConfig";
import allConfigs from "./config";

// This is so Sequelize converts the BIGINT fields back to INTEGER.
// Otherwise, we get the amounts back as strings, which is really something
// we don't want.
//
// For reference: https://github.com/sequelize/sequelize/issues/1774#issuecomment-126714889.
pg.defaults.parseInt8 = true;

export default function (app: Application) {
    const config = allConfigs[ENV];

    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    const oldSetup = app.setup;

    app.set("sequelizeClient", sequelize);

    app.setup = function (...args) {
        const result = oldSetup.apply(this, args);

        // Set up data relationships
        const models = sequelize.models;
        Object.keys(models).forEach((name) => {
            if ("associate" in models[name]) {
                (models[name] as any).associate(models);
            }
        });

        return result;
    };
}
