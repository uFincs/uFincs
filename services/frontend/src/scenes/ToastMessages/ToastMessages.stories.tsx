import type {Meta, StoryObj} from "@storybook/react";
import {useDispatch} from "react-redux";
import {Button} from "components/atoms";
import {toastsSlice} from "store/";
import {ErrorToastData, MessageToastData, SuccessToastData, UndoToastData} from "structures/";
import {storyUsingRedux} from "utils/stories";
import ToastMessages from "./ToastMessages";

const meta: Meta<typeof ToastMessages> = {
    title: "Scenes/Toast Messages",
    component: ToastMessages
};

export default meta;
type Story = StoryObj<typeof ToastMessages>;

/** A story for demonstrating/testing the toast messages. Gives some buttons to create
 *  toasts of various types. */
export const Connected: Story = {
    args: {},
    render: storyUsingRedux(() => {
        const dispatch = useDispatch();

        const createMessageToast = () => {
            const toast = new MessageToastData({message: Math.random().toString()});
            dispatch(toastsSlice.actions.add(toast));
        };

        const createErrorToast = () => {
            const toast = new ErrorToastData({
                message: Math.random().toString(),
                title: "An error!"
            });
            dispatch(toastsSlice.actions.add(toast));
        };

        const createSuccessToast = () => {
            const toast = new SuccessToastData({message: Math.random().toString(), title: "Tada!"});
            dispatch(toastsSlice.actions.add(toast));
        };

        const createUndoToast = () => {
            const toast = new UndoToastData({message: Math.random().toString()});
            dispatch(toastsSlice.actions.add(toast));
        };

        return (
            <div className="ToastMessages--story-Connected">
                <Button onClick={createMessageToast}>Message Toast</Button>
                <Button onClick={createErrorToast}>Error Toast</Button>
                <Button onClick={createSuccessToast}>Success Toast</Button>
                <Button onClick={createUndoToast}>Undo Toast</Button>

                <ToastMessages />
            </div>
        );
    })
};
