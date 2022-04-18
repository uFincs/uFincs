import Sequelize, {QueryInterface} from "sequelize";

const addForeignKey =
    (queryInterface: QueryInterface) =>
    async (source: string, target: string, columnName: string) => {
        await queryInterface.addColumn(source, columnName, {
            type: Sequelize.UUID,
            references: {
                model: target,
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL"
        });

        await queryInterface.addIndex(source, [columnName]);
    };

export default addForeignKey;
