import {SmallToast} from "components/molecules";
import "./UndoToast.scss";

interface UndoToastProps {
    /** Message to display. */
    message: string;

    /** Handler for closing the toast. */
    onClose: () => void;

    /** Handler for triggering an undo. */
    onUndo: () => void;
}

/** An `UndoToast` is a `SmallToast` that has the action bound to 'Undo'. */
const UndoToast = ({message, onClose, onUndo, ...otherProps}: UndoToastProps) => (
    <SmallToast
        actionLabel="Undo"
        message={message}
        onAction={onUndo}
        onClose={onClose}
        {...otherProps}
    />
);

export default UndoToast;
