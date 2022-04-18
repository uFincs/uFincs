import {QueryInterface} from "sequelize";
import {feedbackSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {FEEDBACK} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        const existingColumns = await queryInterface.describeTable(FEEDBACK);

        if (!("type" in existingColumns)) {
            await queryInterface.addColumn(FEEDBACK, "type", feedbackSchema.type);
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(FEEDBACK, "type");
    }
};
