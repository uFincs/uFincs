import {QueryInterface} from "sequelize";
import tableNames from "db/tableNames";

const {RECURRING_TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.sequelize.query(
            `UPDATE "${RECURRING_TRANSACTIONS}" SET "lastRealizedDate" = null;`
        );
    },
    down: async () => {
        return;
    }
};
