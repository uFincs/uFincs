import Sequelize, {QueryInterface} from "sequelize";
import tableNames from "db/tableNames";

const {ACCOUNTS, TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        const accountColumns = (await queryInterface.describeTable(ACCOUNTS)) as Record<
            string,
            any
        >;

        const transactionColumns = (await queryInterface.describeTable(TRANSACTIONS)) as Record<
            string,
            any
        >;

        if (accountColumns?.interest?.type === "INTEGER") {
            await queryInterface.changeColumn(ACCOUNTS, "interest", Sequelize.BIGINT);
        }

        if (accountColumns?.openingBalance?.type === "INTEGER") {
            await queryInterface.changeColumn(ACCOUNTS, "openingBalance", Sequelize.BIGINT);
        }

        if (transactionColumns?.amount?.type === "INTEGER") {
            await queryInterface.changeColumn(TRANSACTIONS, "amount", Sequelize.BIGINT);
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.changeColumn(ACCOUNTS, "interest", Sequelize.INTEGER);
        await queryInterface.changeColumn(ACCOUNTS, "openingBalance", Sequelize.INTEGER);

        await queryInterface.changeColumn(TRANSACTIONS, "amount", Sequelize.INTEGER);
    }
};
