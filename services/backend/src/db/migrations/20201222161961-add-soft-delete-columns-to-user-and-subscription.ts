import {QueryInterface} from "sequelize";
import {subscriptionsSchema, usersSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {SUBSCRIPTIONS, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        // Depending on when this migration runs, the soft-delete columns might already exist:
        //
        // If the database was created fresh, then the columns would be created as part of the
        // users table creation (since they are part of the schema).
        //
        // If the migration is run on an existing database, then the columns won't exist yet,
        // and they wouldn't have been created by the users table migration.
        //
        // As such, we should only create them if they don't exist.
        const existingSubscriptionColumns = await queryInterface.describeTable(SUBSCRIPTIONS);
        const existingUserColumns = await queryInterface.describeTable(USERS);

        if (!("deletedAt" in existingSubscriptionColumns)) {
            await queryInterface.addColumn(
                SUBSCRIPTIONS,
                "deletedAt",
                subscriptionsSchema.deletedAt
            );
        }

        if (!("deletedAt" in existingUserColumns)) {
            await queryInterface.addColumn(USERS, "deletedAt", usersSchema.deletedAt);
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(SUBSCRIPTIONS, "deletedAt");
        await queryInterface.removeColumn(USERS, "deletedAt");
    }
};
