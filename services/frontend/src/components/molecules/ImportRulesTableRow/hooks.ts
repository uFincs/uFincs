import {useCallback} from "react";
import {useOnActiveKey, useKeyboardNavigation} from "hooks/";
import {ValueFormatting} from "services/";
import {ImportRulesTableRowProps} from "./ImportRulesTableRow";

/** Helper function for focusing onto the next row. */
const focusNext = (index: number = 0) => {
    const nextRow: any = document.querySelector(`[data-index='${index + 1}']`);

    if (nextRow) {
        nextRow?.focus();
    } else {
        (document.querySelector("[data-index]") as any)?.focus();
    }
};

/** Helper function for focusing onto the previous row. */
const focusPrevious = (index: number = 0) => {
    const previousRow: any = document.querySelector(`[data-index='${index - 1}']`);

    if (previousRow) {
        previousRow?.focus();
    } else {
        const allRows: NodeListOf<any> = document.querySelectorAll("[data-index]");
        allRows[allRows.length - 1]?.focus();
    }
};

/** Hook for generating the handlers necessary for enabling up/down arrow
 *  key navigation between rows. */
const useFocusNavigation = (index: number = 0) => {
    const onFocusNext = useCallback(() => focusNext(index), [index]);
    const onFocusPrevious = useCallback(() => focusPrevious(index), [index]);

    const onFocusNav = useKeyboardNavigation({
        onNext: onFocusNext,
        onPrevious: onFocusPrevious,
        disableKeys: {home: true, end: true, left: true, right: true}
    });

    return onFocusNav;
};

/** The primary hook for all of the `ImportRulesTableRow` logic. */
export const useImportRulesTableRow = ({
    index,
    updatedAt,
    onClick
}: Omit<ImportRulesTableRowProps, "actions" | "conditions" | "onDelete" | "onEdit">) => {
    const formattedDate = ValueFormatting.formatDate(updatedAt);

    const onRowClick = onClick;

    const onFocusNav = useFocusNavigation(index);
    const onClickWithKeyDown = useOnActiveKey(onRowClick);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            onFocusNav(e);
            onClickWithKeyDown(e);
        },
        [onClickWithKeyDown, onFocusNav]
    );

    return {
        formattedDate,
        onKeyDown,
        onRowClick
    };
};
