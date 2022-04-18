import {Id} from "utils/types";

interface ObjectWithId {
    id: Id;
}

export const idMap =
    <O extends ObjectWithId>() =>
    (id: Id, objectsById: Record<Id, O>) =>
        objectsById[id];

export const idsMap =
    <O extends ObjectWithId>() =>
    (ids: Array<Id>, objectsById: Record<Id, O>) => {
        return ids.reduce((acc, id) => {
            if (id in objectsById) {
                acc.push(objectsById[id]);
            }

            return acc;
        }, [] as Array<O>);
    };
