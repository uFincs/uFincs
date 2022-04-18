import {QueryInterface} from "sequelize";
import {usersSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        const existingColumns = await queryInterface.describeTable(USERS);

        if (!("isOnboarded" in existingColumns)) {
            await queryInterface.addColumn(USERS, "isOnboarded", usersSchema.isOnboarded);

            // Make it so all existing users are 'onboarded' already.
            await queryInterface.sequelize.query(
                `UPDATE ${USERS} SET "isOnboarded" = TRUE WHERE "isOnboarded" IS NULL;`
            );
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(USERS, "isOnboarded");
    }
};
