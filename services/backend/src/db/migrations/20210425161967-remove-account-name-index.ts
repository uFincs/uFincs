import {QueryInterface} from "sequelize";
import tableNames from "db/tableNames";

const {ACCOUNTS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex(ACCOUNTS, ["name"]);
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.addIndex(ACCOUNTS, ["name"]);
    }
};
