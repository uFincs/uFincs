import {HookContext} from "@feathersjs/feathers";

const findFromUser = () => (context: HookContext) => {
    if (context.params.query) {
        context.params.query.userId = context.params.user.id;
    }

    return context;
};

export default findFromUser;
