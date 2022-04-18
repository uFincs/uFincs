import Sequelize from "sequelize";

export default {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        autoIncrement: false
    },
    name: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    type: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    openingBalance: {
        type: Sequelize.TEXT
    },
    interest: {
        type: Sequelize.TEXT
    },
    createdAt: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.TEXT,
        allowNull: false
    }
};
