import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importProfilesSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {IMPORT_PROFILES, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(IMPORT_PROFILES, importProfilesSchema);

        await addForeignKey(queryInterface)(
            IMPORT_PROFILES,
            USERS,
            foreignKeys[IMPORT_PROFILES][USERS].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(IMPORT_PROFILES);
    }
};
