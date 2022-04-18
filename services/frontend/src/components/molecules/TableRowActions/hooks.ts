import {useOnActiveKey, useStopPropagationCallback} from "hooks/";

/** Hook for generating all of the handlers for the actions (delete/edit). */
export const useActionInteractions = (onDelete: () => void, onEdit: () => void) => {
    const onDeleteClick = useStopPropagationCallback(onDelete);
    const onEditClick = useStopPropagationCallback(onEdit);

    const onDeleteKeyDown = useOnActiveKey(onDeleteClick);
    const onEditKeyDown = useOnActiveKey(onEditClick);

    return {onDeleteClick, onEditClick, onDeleteKeyDown, onEditKeyDown};
};
