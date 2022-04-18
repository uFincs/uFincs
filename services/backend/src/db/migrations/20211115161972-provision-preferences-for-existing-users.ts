import Sequelize, {QueryInterface} from "sequelize";
import tableNames from "db/tableNames";

const {PREFERENCES, USERS} = tableNames;

const getUserIds = async (queryInterface: QueryInterface) => {
    // OK, half of this is a lie.
    // We specify "id" as the attribute to select, but passing `plain: false` just gives us the whole
    // objects anyways, so... And we need `plain: false` to get all of the users rather than just one.
    const users = (await queryInterface.rawSelect(
        USERS,
        {plain: false},
        "id"
    )) as unknown as Array<{id: string}>;

    if (!users || users.length === 0) {
        return null;
    }

    return users.map(({id}) => id);
};

export default {
    up: async (queryInterface: QueryInterface) => {
        const userIds = await getUserIds(queryInterface);

        if (!userIds) {
            return;
        }

        const now = new Date();
        const preferences = [];

        for (const userId of userIds) {
            preferences.push({
                userId,
                currency: null,
                createdAt: now,
                updatedAt: now
            });
        }

        await queryInterface.bulkInsert(PREFERENCES, preferences);
    },
    down: async (queryInterface: QueryInterface, sequelize: typeof Sequelize) => {
        const userIds = await getUserIds(queryInterface);

        if (!userIds) {
            return;
        }

        return queryInterface.bulkDelete(PREFERENCES, {userId: {[sequelize.Op.in]: userIds}});
    }
};
