import {useMemo} from "react";
import {Id, ObjectWithId} from "utils/types";

/** Transforms an array of objects to an array of IDs. */
const useMapObjectsToIds = (objects: Array<ObjectWithId>): Array<Id> =>
    useMemo(() => objects.map(({id}) => id), [objects]);

export default useMapObjectsToIds;
