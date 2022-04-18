import Sequelize, {QueryInterface} from "sequelize";
import tableNames from "db/tableNames";

const {ACCOUNTS, IMPORT_PROFILES, IMPORT_PROFILE_MAPPINGS, TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        // Account Changes
        await queryInterface.changeColumn(ACCOUNTS, "name", Sequelize.TEXT);
        await queryInterface.changeColumn(ACCOUNTS, "type", Sequelize.TEXT);
        await queryInterface.changeColumn(ACCOUNTS, "interest", Sequelize.TEXT);
        await queryInterface.changeColumn(ACCOUNTS, "openingBalance", Sequelize.TEXT);

        // Transaction Changes
        await queryInterface.changeColumn(TRANSACTIONS, "amount", Sequelize.TEXT);
        await queryInterface.changeColumn(TRANSACTIONS, "description", Sequelize.TEXT);
        await queryInterface.changeColumn(TRANSACTIONS, "notes", Sequelize.TEXT);
        await queryInterface.changeColumn(TRANSACTIONS, "type", Sequelize.TEXT);

        // Import Profile Changes
        await queryInterface.changeColumn(IMPORT_PROFILES, "name", Sequelize.TEXT);

        // Import Profile Mapping Changes
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "from", Sequelize.TEXT);
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "to", Sequelize.TEXT);
    },
    down: async (queryInterface: QueryInterface) => {
        // Account Changes
        await queryInterface.changeColumn(ACCOUNTS, "name", Sequelize.STRING);
        await queryInterface.changeColumn(ACCOUNTS, "type", Sequelize.STRING);
        await queryInterface.changeColumn(ACCOUNTS, "interest", Sequelize.BIGINT);
        await queryInterface.changeColumn(ACCOUNTS, "openingBalance", Sequelize.BIGINT);

        // Transaction Changes
        await queryInterface.changeColumn(TRANSACTIONS, "amount", Sequelize.BIGINT);
        await queryInterface.changeColumn(TRANSACTIONS, "description", Sequelize.STRING);
        await queryInterface.changeColumn(TRANSACTIONS, "notes", Sequelize.STRING);
        await queryInterface.changeColumn(TRANSACTIONS, "type", Sequelize.STRING);

        // Import Profile Changes
        await queryInterface.changeColumn(IMPORT_PROFILES, "name", Sequelize.STRING);

        // Import Profile Mapping Changes
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "from", Sequelize.STRING);
        await queryInterface.changeColumn(IMPORT_PROFILE_MAPPINGS, "to", Sequelize.STRING);
    }
};
