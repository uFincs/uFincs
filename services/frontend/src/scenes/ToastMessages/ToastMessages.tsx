import {animated, useTransition} from "react-spring";
import {SmallToast, LargeToast, ServiceWorkerUpdateToast, UndoToast} from "components/molecules";
import {
    ErrorToastData,
    MessageToastData,
    ServiceWorkerUpdateToastData,
    SuccessToastData,
    UndoToastData,
    WarningToastData
} from "structures/";
import connect, {ConnectedProps} from "./connect";
import "./ToastMessages.scss";

// This maps toast types to components (+ metadata).
const toastTypeMappings = {
    [MessageToastData.TYPE]: {
        Toast: SmallToast,
        actions: MessageToastData.ACTIONS
    },
    [ErrorToastData.TYPE]: {
        Toast: LargeToast,
        actions: ErrorToastData.ACTIONS,
        variant: "negative"
    },
    [ServiceWorkerUpdateToastData.TYPE]: {
        Toast: ServiceWorkerUpdateToast,
        actions: ServiceWorkerUpdateToastData.ACTIONS
    },
    [SuccessToastData.TYPE]: {
        Toast: LargeToast,
        actions: SuccessToastData.ACTIONS,
        variant: "positive"
    },
    [UndoToastData.TYPE]: {
        Toast: UndoToast,
        actions: UndoToastData.ACTIONS
    },
    [WarningToastData.TYPE]: {
        Toast: LargeToast,
        actions: WarningToastData.ACTIONS,
        variant: "warning"
    }
} as const;

interface ToastMessagesProps extends ConnectedProps {}

/** A container for displaying the toasts. Handles pulling the toast data from the store
 *  and creating the toasts that are then displayed in a list in the bottom left corner
 *  of the screen (or center on mobile).
 */
const ToastMessages = ({toasts = [], onToastAction}: ToastMessagesProps) => {
    // Docs for the new `useTransition` API:
    // https://aleclarson.github.io/react-spring/v9/breaking-changes/#The-useTransition-hook
    const transition = useTransition(toasts, {
        keys: (toast: any) => toast.id,
        from: {opacity: 0, x: -150},
        enter: {opacity: 1, x: 0},
        leave: {opacity: 0, x: 150}
    });

    const toastMessages = transition((style, {id, type, message, title, ...toastActions}) => {
        const {Toast, actions, variant} = toastTypeMappings[type];

        type ActionProps = {[K in (typeof actions)[number]]: () => void};

        // Look, I couldn't figure out how to type `reduce` properly, so we're just
        // chucking some anys in here and calling it a day.
        //
        // Here's some references for how/why the ActionProps type works:
        // https://stackoverflow.com/a/52174119, https://stackoverflow.com/a/54071129
        const actionProps: ActionProps = actions.reduce((acc: any, action: string) => {
            acc[action] = () => onToastAction(toastActions[action]);
            return acc;
        }, {});

        return (
            // @ts-expect-error Missing children prop: https://github.com/pmndrs/react-spring/issues/2358
            <animated.div style={style}>
                <Toast
                    key={id}
                    message={message}
                    title={title}
                    variant={variant}
                    {...actionProps}
                />
            </animated.div>
        );
    });

    return (
        <div className="ToastMessages" data-testid="toast-messages" role="alert">
            {toastMessages}
        </div>
    );
};

const ConnectedToastMessages = connect(ToastMessages);
export default ConnectedToastMessages;
