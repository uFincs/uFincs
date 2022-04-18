import Sequelize from "sequelize";

export default {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        autoIncrement: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    edek: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    kekSalt: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    isOnboarded: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        default: false
    },
    // These are all fields added by feathers-authentication-management.
    isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        default: false
    },
    verifyToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    verifyShortToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    verifyExpires: {
        type: Sequelize.DATE,
        allowNull: true
    },
    verifyChanges: {
        type: Sequelize.JSON,
        allowNull: true
    },
    resetToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    resetShortToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    resetExpires: {
        type: Sequelize.DATE,
        allowNull: true
    },
    resetAttempts: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    // Need this for the soft deletes enabled by the `paranoid` option in the Users model.
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
};
