import Sequelize, {QueryInterface} from "sequelize";
import tableNames from "db/tableNames";

const {ACCOUNTS, IMPORT_PROFILES, IMPORT_PROFILE_MAPPINGS, TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        // Account Changes
        await queryInterface.changeColumn(ACCOUNTS, "createdAt", Sequelize.TEXT);
        await queryInterface.changeColumn(ACCOUNTS, "updatedAt", Sequelize.TEXT);

        // Transaction Changes
        await queryInterface.changeColumn(TRANSACTIONS, "date", Sequelize.TEXT);
        await queryInterface.changeColumn(TRANSACTIONS, "createdAt", Sequelize.TEXT);
        await queryInterface.changeColumn(TRANSACTIONS, "updatedAt", Sequelize.TEXT);

        // Import Profile Changes
        await queryInterface.changeColumn(IMPORT_PROFILES, "createdAt", Sequelize.TEXT);
        await queryInterface.changeColumn(IMPORT_PROFILES, "updatedAt", Sequelize.TEXT);

        // Import Profile Mapping Changes
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "createdAt", Sequelize.TEXT);
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "updatedAt", Sequelize.TEXT);
    },
    down: async (queryInterface: QueryInterface) => {
        // Account Changes
        await queryInterface.changeColumn(ACCOUNTS, "createdAt", Sequelize.DATE);
        await queryInterface.changeColumn(ACCOUNTS, "updatedAt", Sequelize.DATE);

        // Transaction Changes
        await queryInterface.changeColumn(TRANSACTIONS, "date", Sequelize.DATE);
        await queryInterface.changeColumn(TRANSACTIONS, "createdAt", Sequelize.DATE);
        await queryInterface.changeColumn(TRANSACTIONS, "updatedAt", Sequelize.DATE);

        // Import Profile Changes
        await queryInterface.changeColumn(IMPORT_PROFILES, "createdAt", Sequelize.DATE);
        await queryInterface.changeColumn(IMPORT_PROFILES, "updatedAt", Sequelize.DATE);

        // Import Profile Mapping Changes
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "createdAt", Sequelize.DATE);
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "updatedAt", Sequelize.DATE);
    }
};
