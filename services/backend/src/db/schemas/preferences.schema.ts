import Sequelize from "sequelize";
import foreignKeys from "db/foreignKeys";
import tableNames from "db/tableNames";

const {PREFERENCES, USERS} = tableNames;

export default {
    // Use the user ID as the primary key.
    [foreignKeys[PREFERENCES][USERS].key]: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
            model: USERS,
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
    },
    currency: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
    }
};
