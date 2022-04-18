import {createAction, PayloadActionCreator} from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid";
import {Id} from "utils/types";

export class ToastData {
    id: Id;
    type: string;
    message: string;
    title: string;

    onClose: PayloadActionCreator<void>;

    constructor({id = uuidv4(), type = "", message = "", title = ""}) {
        this.id = id;
        this.type = type;
        this.message = message;

        // Assign the message to the title if no separate title was assigned.
        this.title = title ? title : message;

        this.onClose = createAction(`TOAST_ACTION_CLOSE/${id}`);
    }
}

export class MessageToastData extends ToastData {
    static TYPE = "TOAST_TYPE_MESSAGE";
    static ACTIONS = ["onClose"] as const;

    constructor({id = uuidv4(), message = "", title = ""}) {
        super({id, message, title, type: MessageToastData.TYPE});

        this.onClose = createAction(`${MessageToastData.TYPE}_ACTION_CLOSE/${id}`);
    }
}

export class ErrorToastData extends ToastData {
    static TYPE = "TOAST_TYPE_ERROR";
    static ACTIONS = ["onClose"] as const;

    constructor({id = uuidv4(), message = "", title = "Error"}) {
        super({id, message, title, type: ErrorToastData.TYPE});

        this.onClose = createAction(`${ErrorToastData.TYPE}_ACTION_CLOSE/${id}`);
    }
}

export class SuccessToastData extends ToastData {
    static TYPE = "TOAST_TYPE_SUCCESS";
    static ACTIONS = ["onClose"] as const;

    constructor({id = uuidv4(), message = "", title = "Success!"}) {
        super({id, message, title, type: SuccessToastData.TYPE});

        this.onClose = createAction(`${SuccessToastData.TYPE}_ACTION_CLOSE/${id}`);
    }
}

export class WarningToastData extends ToastData {
    static TYPE = "TOAST_TYPE_WARNING";
    static ACTIONS = ["onClose"] as const;

    constructor({id = uuidv4(), message = "", title = "Warning"}) {
        super({id, message, title, type: WarningToastData.TYPE});

        this.onClose = createAction(`${WarningToastData.TYPE}_ACTION_CLOSE/${id}`);
    }
}

export class ServiceWorkerUpdateToastData extends ToastData {
    onClose: PayloadActionCreator<void>;
    onUpdate: PayloadActionCreator<void>;

    static TYPE = "TOAST_TYPE_SERVICE_WORKER_UPDATE";
    static ACTIONS = ["onClose", "onUpdate"] as const;

    constructor({id = uuidv4()} = {}) {
        const type = ServiceWorkerUpdateToastData.TYPE;
        super({id, type, message: "A new version of uFincs is available"});

        this.onClose = createAction(`${type}_ACTION_CLOSE/${id}`);
        this.onUpdate = createAction(`${type}_ACTION_UPDATE/${id}`);
    }
}

export class UndoToastData extends ToastData {
    onClose: PayloadActionCreator<void>;
    onUndo: PayloadActionCreator<void>;

    static TYPE = "TOAST_TYPE_UNDO";
    static ACTIONS = ["onClose", "onUndo"] as const;

    constructor({id = uuidv4(), type = UndoToastData.TYPE, message = ""}) {
        super({id, type, message});

        this.onClose = createAction(`${type}_ACTION_CLOSE/${id}`);
        this.onUndo = createAction(`${type}_ACTION_UNDO/${id}`);
    }
}
