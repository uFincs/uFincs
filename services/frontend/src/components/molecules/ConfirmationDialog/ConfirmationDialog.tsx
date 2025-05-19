import classNames from "classnames";
import {useEffect, useRef} from "react";
import {WarningIcon} from "assets/icons";
import {CloseButton, DialogContainer, LinkButton, ShadowButton} from "components/atoms";
import {DialogContainerProps} from "components/atoms/DialogContainer";
import "./ConfirmationDialog.scss";

const variantIcon = {
    negative: WarningIcon
} as const;

interface ConfirmationDialogProps extends DialogContainerProps {
    /** Custom class name. */
    className?: string;

    /** Label for the primary action button. */
    primaryActionLabel: string;

    /** Label for the secondary action button. */
    secondaryActionLabel?: string;

    /** The type of dialog. Changes the color theme and icon. */
    variant?: "negative";

    /** Handler for the primary action button. */
    onPrimaryAction: () => void;
}

/** A modal dialog used for prompting the user for confirmation to complete an action. */
const ConfirmationDialog = ({
    className,
    isVisible = false,
    primaryActionLabel,
    secondaryActionLabel = "Cancel",
    title,
    variant = "negative",
    onClose,
    onPrimaryAction,
    children,
    ...otherProps
}: ConfirmationDialogProps) => {
    const {secondaryActionRef} = useFocusSecondaryOnMount(isVisible);
    const VariantIcon = variantIcon[variant];

    return (
        <DialogContainer
            className={classNames(
                "ConfirmationDialog",
                `ConfirmationDialog--${variant}`,
                className
            )}
            isVisible={isVisible}
            title={title}
            onClose={onClose}
            {...otherProps}
        >
            <div className="ConfirmationDialog-body">
                <div
                    className={classNames(
                        "ConfirmationDialog-icon-container",
                        `ConfirmationDialog-icon-container--${variant}`
                    )}
                >
                    <VariantIcon
                        className={classNames(
                            "ConfirmationDialog-icon",
                            `ConfirmationDialog-icon--${variant}`
                        )}
                    />
                </div>

                <div className="ConfirmationDialog-content-container">
                    <h2 className="ConfirmationDialog-header">{title}</h2>

                    {/* Make the content focusable to satisfy keyboard accessibility in
                            case the content so large it needs to be scrollable. */}
                    <div className="ConfirmationDialog-content" tabIndex={0}>
                        {children}
                    </div>
                </div>

                <CloseButton
                    className={classNames("ConfirmationDialog-close-button")}
                    title="Close"
                    onClick={onClose}
                />
            </div>

            <div className="ConfirmationDialog-actions">
                <LinkButton
                    className="ConfirmationDialog-action-secondary"
                    data-testid="confirmation-dialog-secondary-action"
                    ref={secondaryActionRef}
                    onClick={onClose}
                >
                    {secondaryActionLabel}
                </LinkButton>

                <ShadowButton
                    className="ConfirmationDialog-action-primary"
                    data-testid="confirmation-dialog-primary-action"
                    variant={variant}
                    onClick={onPrimaryAction}
                >
                    {primaryActionLabel}
                </ShadowButton>
            </div>
        </DialogContainer>
    );
};

export default ConfirmationDialog;

/* Hooks */

// Focus onto the secondary action (the less destructive action) on mount as a UX optimization.
// For reference: https://ux.stackexchange.com/a/126883.
const useFocusSecondaryOnMount = (isVisible: boolean) => {
    const secondaryActionRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (isVisible) {
            secondaryActionRef?.current?.focus();
        }
    }, [secondaryActionRef, isVisible]);

    return {secondaryActionRef};
};
