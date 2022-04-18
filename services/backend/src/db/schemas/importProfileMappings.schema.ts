import Sequelize from "sequelize";

export default {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        autoIncrement: false
    },
    from: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    to: {
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
