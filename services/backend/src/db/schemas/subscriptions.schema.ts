import Sequelize from "sequelize";

export default {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        autoIncrement: false
    },
    // [start] The following IDs are from Stripe.
    customerId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    productId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    priceId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    subscriptionId: {
        type: Sequelize.STRING,
        allowNull: true
    },
    // [end]
    status: {
        type: Sequelize.STRING
    },
    periodStart: {
        type: Sequelize.DATE,
        allowNull: true
    },
    periodEnd: {
        type: Sequelize.DATE,
        allowNull: true
    },
    isLifetime: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    // Need this for the soft deletes enabled by the `paranoid` option in the Subscriptions model.
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
};
