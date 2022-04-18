import {QueryInterface} from "sequelize";
import {usersSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        // Depending on when this migration runs, the encryption columns might already exist:
        //
        // If the database was created fresh, then the columns would be created as part of the
        // users table creation (since they are part of the schema).
        //
        // If the migration is run on an existing database, then the columns won't exist yet,
        // and they wouldn't have been created by the users table migration.
        //
        // As such, we should only create them if they don't exist.
        const existingColumns = await queryInterface.describeTable(USERS);

        if (!("edek" in existingColumns)) {
            await queryInterface.addColumn(USERS, "edek", usersSchema.edek);
        }

        if (!("kekSalt" in existingColumns)) {
            await queryInterface.addColumn(USERS, "kekSalt", usersSchema.kekSalt);
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(USERS, "edek");
        await queryInterface.removeColumn(USERS, "kekSalt");
    }
};
