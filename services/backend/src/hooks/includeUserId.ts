import {HookContext} from "@feathersjs/feathers";

const includeUserId = () => (context: HookContext) => {
    const {data} = context;
    const userId = context.params.user.id;

    if (Array.isArray(data)) {
        const dataWithIds = data.map((singleItem) => {
            singleItem.userId = userId;
            return singleItem;
        });

        context.data = dataWithIds;
    } else {
        context.data.userId = userId;
    }
};

export default includeUserId;
