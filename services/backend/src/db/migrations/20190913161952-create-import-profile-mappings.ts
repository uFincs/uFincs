import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importProfileMappingsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {IMPORT_PROFILES, IMPORT_PROFILE_MAPPINGS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(IMPORT_PROFILE_MAPPINGS, importProfileMappingsSchema);

        await addForeignKey(queryInterface)(
            IMPORT_PROFILE_MAPPINGS,
            IMPORT_PROFILES,
            foreignKeys[IMPORT_PROFILE_MAPPINGS][IMPORT_PROFILES].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(IMPORT_PROFILE_MAPPINGS);
    }
};
