import Sequelize from "sequelize";
import transactionsSchema from "./transactions.schema";

// Want to just remove `date` from the schema; don't need to do anything with it.
// eslint-disable-next-line
const {date, ...restSchema} = transactionsSchema;

export default {
    ...restSchema,
    interval: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    freq: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    on: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    startDate: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    endDate: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    count: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    neverEnds: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    lastRealizedDate: {
        type: Sequelize.TEXT,
        allowNull: true
    }
};
