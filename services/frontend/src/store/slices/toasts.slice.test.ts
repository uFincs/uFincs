import {ErrorToastData, MessageToastData, ToastData} from "structures/";
import {toastsSlice} from "./toasts.slice";

const toast = new ToastData({id: "1"});

const toasts = {
    byId: {
        [toast.id]: toast
    },
    allIds: [toast.id]
};

describe("toasts reducer", () => {
    const {reducer, actions} = toastsSlice;

    it("can add a toast", () => {
        expect(reducer(undefined, actions.add(toast))).toEqual(toasts);
    });

    it("can delete a toast", () => {
        expect(reducer(toasts, actions.delete(toast.id))).toEqual({byId: {}, allIds: []});
    });

    it("won't add duplicate error toasts", () => {
        const errorToast1 = new ErrorToastData({title: "error", message: "dun goofed"});

        // Create a separate object so it has a different ID.
        // Why? Because the duplication logic doesn't use IDs.
        const errorToast2 = new ErrorToastData({title: "error", message: "dun goofed"});

        const state1 = reducer(undefined, actions.add(errorToast1));
        const state2 = reducer(state1, actions.add(errorToast2));

        expect(state1).toEqual(state2);
    });

    it("can add duplicate non-error toasts", () => {
        const toast1 = new MessageToastData({title: "error", message: "dun goofed"});
        const toast2 = new MessageToastData({title: "error", message: "dun goofed"});

        const state1 = reducer(undefined, actions.add(toast1));
        const state2 = reducer(state1, actions.add(toast2));

        expect(state1).not.toEqual(state2);
        expect(state1.allIds).toEqual([toast1.id]);
        expect(state2.allIds).toEqual([toast1.id, toast2.id]);
    });
});

describe("getToasts selector", () => {
    const {selectToasts} = toastsSlice.selectors;

    it("can get the ordered set of toasts from the state", () => {
        const state = {[toastsSlice.name]: toasts};
        expect(selectToasts(state)).toEqual([toast]);
    });
});
