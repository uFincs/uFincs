import classNames from "classnames";
import React, {useEffect, useMemo, useRef} from "react";
import ReactDOM from "react-dom";
import {ChevronDownIcon} from "assets/icons";
import {Button, Divider, Dropdown} from "components/atoms";
import {BulkActionDialog, SelectableListCheckbox} from "components/molecules";
import {useStickyToTop} from "hooks/";
import {BulkEditableTransactionProperty, Transaction} from "models/";
import {Id, SuggestionOption} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import {useBulkTransactionActions, ActionType, DialogType} from "./hooks";
import "./BulkTransactionActions.scss";

const DIALOG_TYPES: Array<DialogType> = ["account", "amount", "date", "description", "type"];

const ACTION_LABELS_MAP: Record<ActionType, string> = {
    account: "Change Account...",
    amount: "Change Amount...",
    date: "Change Date...",
    description: "Change Description...",
    type: "Change Type...",
    exclude: "Exclude from Import",
    include: "Include in Import"
} as const;

const ACTION_PROPERTIES_MAP: Record<ActionType, BulkEditableTransactionProperty> = {
    // Note: The property for `account` is actually dynamic, since it can switch between credit/debit
    // depending on the transaction type. It's only here to satisfy the type constraint.
    // That's why you should use `getTransactionProperty` instead of directly using ACTION_PROPERTIES_MAP.
    account: "creditAccountId",
    amount: "amount",
    date: "date",
    description: "description",
    type: "type",
    exclude: "includeInImport",
    include: "includeInImport"
} as const;

// For the last two actions (with dialogs) in the desktop layout, we align the dialogs to the right side
// of the button instead of the left to account for the fact that the dialog might be too
// wide and might go off the screen.
const DIALOG_ALIGNMENTS_MAP: Record<DialogType, "left" | "right"> = {
    account: "left",
    amount: "left",
    date: "left",
    description: "right",
    type: "right"
} as const;

const DIALOG_PROPS = {
    account: {
        "data-testid": "bulk-action-dialog-account",
        inputType: "select",
        label: "Account"
    },
    amount: {
        "data-testid": "bulk-action-dialog-amount",
        inputType: "money",
        label: "Amount"
    },
    date: {
        "data-testid": "bulk-action-dialog-date",
        inputType: "date",
        label: "Date"
    },
    description: {
        "data-testid": "bulk-action-dialog-description",
        inputType: "text",
        label: "Description"
    },
    type: {
        "data-testid": "bulk-action-dialog-type",
        inputType: "transactionType",
        label: "Type"
    }
} as const;

const getTransactionProperty = (
    action: ActionType,
    editableAccountProperty?: BulkEditableTransactionProperty
): BulkEditableTransactionProperty => {
    if (action === "account" && editableAccountProperty) {
        return editableAccountProperty;
    } else {
        return ACTION_PROPERTIES_MAP[action];
    }
};

interface BulkTransactionActionsProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The title to display above the (desktop) bulk actions. */
    title?: string;

    /** The list of transactions to operate on.
     *
     *  This is really needed so that we can check the types of each selected transaction, so that we
     *  can know whether or not ot enable the "Change Account..." action. */
    transactionsById: Record<Id, Transaction>;

    /** Handler for submitting an action's changes. */
    onSubmit: (ids: Array<Id>, property: BulkEditableTransactionProperty, value: string) => void;
}

/** The `BulkTransactionActions` are a series of.. actions for operating on bulk on lists/tables
 *  of items. Specifically, transaction lists/tables. */
const BulkTransactionActions = ({className, ...otherProps}: BulkTransactionActionsProps) => {
    const {containerRef, isSticky} = useStickyToTop();

    // OK, so this is pretty damn hacky. Basically, the actions are made sticky through the use of
    // position: fixed. Pretty normal, right? Well, it turns out that position: fixed doesn't work
    // if one of its parent elements uses any sort of transform. Why? Something to do with
    // the two creating their own (conflicting) 'local coordinate systems'.
    //
    // See https://stackoverflow.com/a/15256339 and
    // http://meyerweb.com/eric/thoughts/2011/09/12/un-fixing-fixed-elements-with-css-transforms/
    // for reference.
    //
    // In effect, this means that we either need to not use transforms or not use position: fixed.
    // Well, we need the transforms (in this case, in the Transactions Import process) to do
    // the step transitions, and position: fixed is much easier than trying to hack some scroll adjusting
    // position: absolute.
    //
    // So what do we do? Think with portals! That's right, in order to not have the position: fixed
    // actions conflict with a transformed parent, we just portal the actions out to some other
    // DOM node that's above the parent! Easy peasy. Kind of...
    const portalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!portalRef.current) {
            // Create the div that will act as the portal, where the fixed actions will be mounted.
            const portalElement = document.createElement("div");

            // This is _another_ massive hack. Basically, inside of `useDropdownMenu`, there is a
            // `useEffect` that listens for all clicks outside of a 'menu' element to decide whether
            // or not to close the dropdown (i.e. the dropdown for the mobile actions menu).
            //
            // eslint-disable-next-line max-len
            // Reference: https://github.com/sparksuite/react-accessible-dropdown-menu-hook/blob/7fb956b57bd89a3dc1b09071f0a4fe11f9a3b874/src/use-dropdown-menu.ts#L67
            //
            // Normally this works fine. However, it seems to interact poorly with the portal.
            // As a result, once the mobile actions go sticky, clicking on the trigger button
            // to open the dropdown menu does... nothing. It opens it and then immediately closes it.
            // Likely because the `useEffect` doesn't acknowledge the portal div as being part of
            // of the dropdown.
            //
            // As such, we make use of the fact that the `useEffect` looks for an element with the
            // 'menu' role on it by assigning the menu role to our portal div. This way, the
            // `useEffect` doesn't incorrectly trigger when clicking on the trigger button.
            //
            // A negative side effect of this is that clicking anywhere inside the sticky mobile actions
            // will no longer close the dropdown; I think this is a small price to pay.
            //
            // Quite frankly, I don't know how it took me this long to realize this was even broken.
            // I guess our e2e tests don't really cover the sticky state, but it somehow must have
            // worked the first time around, otherwise I should have noticed it then.
            //
            // Based on `react-accessible-dropdown-menu-hook`s commit history, it would appear
            // likely that the bug was introduced in:
            //
            // eslint-disable-next-line max-len
            // https://github.com/sparksuite/react-accessible-dropdown-menu-hook/commit/7c9a58355d2dababba3ea3438bd9b33078a7bff2#diff-aab40fa83261e4e0f1f465f01d711bb509e459014a102e012ecb5b100e9f8e95
            //
            // Which would have been November last year. So... it's likely been broken since then,
            // specifically since the upgrade to React 17.
            //
            // Oh well.
            portalElement.setAttribute("role", "menu");

            portalRef.current = portalElement;
        }

        const portal = portalRef.current;

        // Add the portal div into the DOM as a child of the AppRouter.
        const appRouter = document.getElementById("AppRouter");
        appRouter?.appendChild(portal);

        return () => {
            portal.remove();
        };
    });

    if (isSticky && portalRef.current) {
        // This is what gets rendered to the portal.
        // The key difference between this and what's rendered when not sticky is that this doesn't
        // have the containerRef for the sticky hook. Why? See below...
        const renderedOutput = (
            <div
                className={classNames(
                    "BulkTransactionActions",
                    {"BulkTransactionActions--sticky": isSticky},
                    className
                )}
            >
                <DesktopBulkTransactionActions {...otherProps} />
                <MobileBulkTransactionActions {...otherProps} />
            </div>
        );

        return (
            <>
                {/* Here we have to render the original non-sticky container, with the ref, so that the
                    sticky hook knows the right position of where to make it sticky vs not sticky.
                    If we instead left the containerRef on the portal output, then once it becomes sticky,
                    it'll stay permanently sticky since the ref will never intersect
                    with the top of the window. */}
                <div ref={containerRef} />

                {ReactDOM.createPortal(renderedOutput, portalRef.current)}
            </>
        );
    } else {
        return (
            <div
                className={classNames(
                    "BulkTransactionActions",
                    {"BulkTransactionActions--sticky": isSticky},
                    className
                )}
                ref={containerRef}
            >
                <DesktopBulkTransactionActions {...otherProps} />
                <MobileBulkTransactionActions {...otherProps} />
            </div>
        );
    }
};

export default connect(BulkTransactionActions);

/* Desktop Components */

/** The desktop layout of the bulk actions. All of the actions are presented as a sort of
 *  toolbar of actions. */
const DesktopBulkTransactionActions = ({
    accountsByType,
    title = "Bulk Actions",
    transactionsById = {},
    onSubmit
}: BulkTransactionActionsProps) => {
    const {
        accountSuggestions,
        dialogThatIsOpen,
        editableAccountProperty,
        enableActions,
        enableAccountAction,
        selectedTransactionIds,
        onOpenDialog,
        onCloseDialog,
        finalOnSubmit
    } = useBulkTransactionActions(transactionsById, accountsByType, onSubmit);

    const actionsWithDialogs = useMemo(
        () =>
            DIALOG_TYPES.map((type) => {
                let disabledReason = "";

                if (!enableActions) {
                    disabledReason = "No transactions selected";
                } else if (!enableAccountAction) {
                    disabledReason =
                        "Transactions of multiple types selected; " +
                        "select only transactions of a single type to change their account";
                }

                return (
                    <ActionWithDialog
                        key={type}
                        accountSuggestions={type === "account" ? accountSuggestions : undefined}
                        dialogType={type}
                        disabledReason={disabledReason}
                        enabled={type === "account" ? enableAccountAction : enableActions}
                        isDialogOpen={dialogThatIsOpen === type}
                        onOpenDialog={onOpenDialog(type)}
                        onCloseDialog={onCloseDialog}
                        onSubmitDialog={(value: string) =>
                            finalOnSubmit(
                                selectedTransactionIds,
                                getTransactionProperty(type, editableAccountProperty),
                                value
                            )
                        }
                    />
                );
            }),
        [
            accountSuggestions,
            dialogThatIsOpen,
            editableAccountProperty,
            enableAccountAction,
            enableActions,
            finalOnSubmit,
            onCloseDialog,
            onOpenDialog,
            selectedTransactionIds
        ]
    );

    return (
        <div
            className="DesktopBulkTransactionActions"
            data-testid="desktop-bulk-transaction-actions"
        >
            <p className="BulkTransactionActions-title">{title}</p>

            <SelectableListCheckbox
                containerClassName="DesktopBulkTransactionActions-select-all"
                items={Object.values(transactionsById)}
            />

            <div className="DesktopBulkTransactionActions-actions">
                {actionsWithDialogs}

                <Divider />

                <Button
                    className="ActionButton DesktopBulkTransactionActions-exclude-from-import"
                    variant="secondary"
                    disabled={!enableActions}
                    onClick={() =>
                        finalOnSubmit(
                            selectedTransactionIds,
                            getTransactionProperty("exclude"),
                            "false"
                        )
                    }
                >
                    {ACTION_LABELS_MAP.exclude}
                </Button>

                <Button
                    className="ActionButton DesktopBulkTransactionActions-include-in-import"
                    variant="secondary"
                    disabled={!enableActions}
                    onClick={() =>
                        finalOnSubmit(
                            selectedTransactionIds,
                            getTransactionProperty("include"),
                            "true"
                        )
                    }
                >
                    {ACTION_LABELS_MAP.include}
                </Button>
            </div>
        </div>
    );
};

interface ActionWithDialogProps {
    /** The list of account suggestions when this action has `dialogType === "account"`. */
    accountSuggestions?: Array<SuggestionOption>;

    /** The type of the dialog. */
    dialogType: DialogType;

    /** The reason that this action is disabled. */
    disabledReason?: string;

    /** Whether or not the action is enabled. */
    enabled: boolean;

    /** Whether or not this action's dialog is open. */
    isDialogOpen: boolean;

    /** Handler for opening this action's dialog. */
    onOpenDialog: () => void;

    /** Handler for closing this action's dialog. */
    onCloseDialog: () => void;

    /** Handler for submitting the dialog and posting the user's input back up. */
    onSubmitDialog: (value: string) => void;
}

/** A combination of the button used for a bulk action along with the dialog that handles
 *  changing the attribute tied to the action. */
const ActionWithDialog = ({
    accountSuggestions = [],
    dialogType,
    disabledReason = "",
    enabled = false,
    isDialogOpen = false,
    onOpenDialog,
    onCloseDialog,
    onSubmitDialog
}: ActionWithDialogProps) => (
    <div className={`ActionWithDialog align-${DIALOG_ALIGNMENTS_MAP[dialogType]}`}>
        <Button
            className="ActionButton"
            variant="secondary"
            disabled={!enabled}
            title={disabledReason}
            onClick={onOpenDialog}
        >
            {ACTION_LABELS_MAP[dialogType]}
        </Button>

        {isDialogOpen && (
            <BulkActionDialog
                suggestions={accountSuggestions}
                {...DIALOG_PROPS[dialogType]}
                onClose={onCloseDialog}
                onSubmit={onSubmitDialog}
            />
        )}
    </div>
);

/* Mobile Components */

const useGenerateItems = (
    accountActionEnabled: boolean,
    selectedTransactionIds: Array<Id>,
    onOpenDialog: (dialog: DialogType) => () => void,
    onSubmit: (ids: Array<Id>, property: BulkEditableTransactionProperty, value: string) => void
) =>
    useMemo(
        () => [
            {
                label: ACTION_LABELS_MAP["account"],
                onClick: onOpenDialog("account"),
                disabled: !accountActionEnabled
            },
            {label: ACTION_LABELS_MAP["amount"], onClick: onOpenDialog("amount")},
            {label: ACTION_LABELS_MAP["date"], onClick: onOpenDialog("date")},
            {label: ACTION_LABELS_MAP["description"], onClick: onOpenDialog("description")},
            {label: ACTION_LABELS_MAP["type"], onClick: onOpenDialog("type")},
            {
                label: ACTION_LABELS_MAP["exclude"],
                onClick: () =>
                    onSubmit(selectedTransactionIds, getTransactionProperty("exclude"), "false")
            },
            {
                label: ACTION_LABELS_MAP["include"],
                onClick: () =>
                    onSubmit(selectedTransactionIds, getTransactionProperty("include"), "true")
            }
        ],
        [accountActionEnabled, selectedTransactionIds, onOpenDialog, onSubmit]
    );

/** The mobile layout of the bulk actions. Presents the actions as a dropdown due to the
 *  width constraints of mobile. */
const MobileBulkTransactionActions = ({
    accountsByType,
    title,
    transactionsById = {},
    onSubmit
}: BulkTransactionActionsProps) => {
    const {
        accountSuggestions,
        dialogThatIsOpen,
        editableAccountProperty,
        enableActions,
        enableAccountAction,
        selectedTransactionIds,
        onOpenDialog,
        onCloseDialog,
        finalOnSubmit
    } = useBulkTransactionActions(transactionsById, accountsByType, onSubmit);

    const mobileActions = useGenerateItems(
        enableAccountAction,
        selectedTransactionIds,
        onOpenDialog,
        finalOnSubmit
    );

    return (
        <div className="MobileBulkTransactionActions" data-testid="mobile-bulk-transaction-actions">
            <p className="BulkTransactionActions-title">{title}</p>

            <div className="MobileBulkTransactionActions-body">
                <SelectableListCheckbox
                    containerClassName="MobileBulkTransactionActions-select-all"
                    items={Object.values(transactionsById)}
                />

                <Dropdown
                    TriggerButton={MobileBulkTransactionActionsButton}
                    alignment="right"
                    disabled={!enableActions}
                    items={mobileActions}
                />
            </div>

            {dialogThatIsOpen && (
                <BulkActionDialog
                    {...DIALOG_PROPS[dialogThatIsOpen]}
                    suggestions={dialogThatIsOpen === "account" ? accountSuggestions : undefined}
                    onClose={onCloseDialog}
                    onSubmit={(value: string) =>
                        finalOnSubmit(
                            selectedTransactionIds,
                            getTransactionProperty(dialogThatIsOpen, editableAccountProperty),
                            value
                        )
                    }
                />
            )}
        </div>
    );
};

/** The button for the mobile bulk actions dropdown. Styled kind of like an input (has a border)
 *  but acts as a button. */
const MobileBulkTransactionActionsButton = React.forwardRef(
    (props: any, ref: React.Ref<HTMLButtonElement>) => (
        <Button
            className="MobileBulkTransactionActionsButton"
            ref={ref}
            title="Bulk Actions"
            {...props}
        >
            <span>Bulk Actions</span>
            <ChevronDownIcon />
        </Button>
    )
);
