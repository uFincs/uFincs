import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import tableNames from "db/tableNames";

const {ACCOUNTS, TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.renameColumn(
            TRANSACTIONS,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["1"].key,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["credit"].key
        );

        await queryInterface.renameColumn(
            TRANSACTIONS,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["2"].key,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["debit"].key
        );

        await queryInterface.sequelize.query(
            // eslint-disable-next-line
            'UPDATE transactions SET "debitAccountId" = "creditAccountId", "creditAccountId" = "debitAccountId" WHERE type = \'expense\' OR type = \'debt\';'
        );
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.sequelize.query(
            // eslint-disable-next-line
            'UPDATE transactions SET "debitAccountId" = "creditAccountId", "creditAccountId" = "debitAccountId" WHERE type = \'expense\' OR type = \'debt\';'
        );

        await queryInterface.renameColumn(
            TRANSACTIONS,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["credit"].key,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["1"].key
        );

        await queryInterface.renameColumn(
            TRANSACTIONS,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["debit"].key,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["2"].key
        );
    }
};
