import Sequelize from "sequelize";

export default {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        autoIncrement: false
    },
    amount: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    date: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT
    },
    notes: {
        type: Sequelize.TEXT
    },
    type: {
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
