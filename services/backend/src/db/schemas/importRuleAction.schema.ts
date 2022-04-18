import Sequelize from "sequelize";

export default {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        autoIncrement: false
    },
    property: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    value: {
        type: Sequelize.TEXT,
        allowNull: false
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
