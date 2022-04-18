import Sequelize, {QueryInterface} from "sequelize";

type SeedData = Array<{[key: string]: any}>;

const seederGenerator = (tableName: string, seedData: SeedData, seedDataIds: Array<string>) => ({
    up: async (queryInterface: QueryInterface, sequelize: typeof Sequelize) => {
        const data = await queryInterface.rawSelect(
            tableName,
            {
                where: {
                    id: {
                        [sequelize.Op.in]: seedDataIds
                    }
                }
            },
            ["id"]
        );

        if (!data) {
            await queryInterface.bulkInsert(tableName, seedData);
        }
    },
    down: async (queryInterface: QueryInterface, sequelize: typeof Sequelize) => {
        const OpIn = sequelize.Op.in;

        await queryInterface.bulkDelete(tableName, {id: {[OpIn]: seedDataIds}});
    }
});

export default seederGenerator;
