import {QueryInterface} from "sequelize";
import {usersSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        const existingColumns = await queryInterface.describeTable(USERS);

        if (!("isVerified" in existingColumns)) {
            await queryInterface.addColumn(USERS, "isVerified", usersSchema.isVerified);
        }

        if (!("verifyToken" in existingColumns)) {
            await queryInterface.addColumn(USERS, "verifyToken", usersSchema.verifyToken);
        }

        if (!("verifyShortToken" in existingColumns)) {
            await queryInterface.addColumn(USERS, "verifyShortToken", usersSchema.verifyShortToken);
        }

        if (!("verifyExpires" in existingColumns)) {
            await queryInterface.addColumn(USERS, "verifyExpires", usersSchema.verifyExpires);
        }

        if (!("verifyChanges" in existingColumns)) {
            await queryInterface.addColumn(USERS, "verifyChanges", usersSchema.verifyChanges);
        }

        if (!("resetToken" in existingColumns)) {
            await queryInterface.addColumn(USERS, "resetToken", usersSchema.resetToken);
        }

        if (!("resetShortToken" in existingColumns)) {
            await queryInterface.addColumn(USERS, "resetShortToken", usersSchema.resetShortToken);
        }

        if (!("resetExpires" in existingColumns)) {
            await queryInterface.addColumn(USERS, "resetExpires", usersSchema.resetExpires);
        }

        if (!("resetAttempts" in existingColumns)) {
            await queryInterface.addColumn(USERS, "resetAttempts", usersSchema.resetAttempts);
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(USERS, "isVerified");
        await queryInterface.removeColumn(USERS, "verifyToken");
        await queryInterface.removeColumn(USERS, "verifyShortToken");
        await queryInterface.removeColumn(USERS, "verifyExpires");
        await queryInterface.removeColumn(USERS, "verifyChanges");
        await queryInterface.removeColumn(USERS, "resetToken");
        await queryInterface.removeColumn(USERS, "resetShortToken");
        await queryInterface.removeColumn(USERS, "resetExpires");
        await queryInterface.removeColumn(USERS, "resetAttempts");
    }
};
