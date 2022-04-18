import Sequelize, {QueryInterface} from "sequelize";
import {PREFERENCES, PREFERENCE_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";

const tableName = tableNames.PREFERENCES;
const seedData = PREFERENCES;
const seedDataIds = PREFERENCE_IDS;

// Tech Debt: The only reason we can't use the `seederGenerator` here is because preferences are keyed by
// `userId` rather than `id`. I _could_ have just added that it as another param, but considering this is
// (so far) the only use case, I didn't think it was worth it.
export default {
    up: async (queryInterface: QueryInterface, sequelize: typeof Sequelize) => {
        const data = await queryInterface.rawSelect(
            tableName,
            {
                where: {
                    userId: {
                        [sequelize.Op.in]: seedDataIds
                    }
                }
            },
            ["userId"]
        );

        if (!data) {
            await queryInterface.bulkInsert(tableName, seedData);
        }
    },
    down: async (queryInterface: QueryInterface, sequelize: typeof Sequelize) => {
        const OpIn = sequelize.Op.in;

        await queryInterface.bulkDelete(tableName, {userId: {[OpIn]: seedDataIds}});
    }
};
