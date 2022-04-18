const navIdPrefixSmall = "app-navigation-small-item";
const navIdPrefixLarge = "app-navigation-large-item";

export default {
    appRouter: "#AppRouter",
    currentNetWorth: "[data-testid=current-net-worth-indicator]",
    paginationPageSize: "[data-testid=pagination-page-size]",
    toastMessage: "[data-testid=toast-message]",
    toastMessages: "[data-testid=toast-messages]",
    userDropdown: "[data-testid=user-dropdown]",
    userDropdownTrigger: "[data-testid=user-dropdown-trigger]",
    accounts: {
        list: {
            actionDelete: "[data-testid=list-item-delete]",
            actionEdit: "[data-testid=list-item-edit]",
            actionOverflow: "[data-testid=list-item-overflow]"
        },
        desktop: {
            accountsList: "[data-testid=accounts-list-desktop]"
        },
        mobile: {
            accountsList: "[data-testid=accounts-list-mobile]"
        }
    },
    dialogs: {
        primaryAction: "[data-testid=confirmation-dialog-primary-action]",
        secondaryAction: "[data-testid=confirmation-dialog-secondary-action]"
    },
    dateRangePicker: {
        dateSwitcher: "[data-testid=date-switcher]",
        decrementButton: "[data-testid=interval-switcher-decrement]",
        incrementButton: "[data-testid=interval-switcher-increment]",
        startDateInput: "[data-testid=date-switcher-start-date-input]",
        endDateInput: "[data-testid=date-switcher-end-date-input]",
        showFutureToggle: "[data-testid=show-future-toggle]",
        dateRangeSizePicker: {
            desktop: "[data-testid=date-range-size-picker-desktop]",
            mobile: "[data-testid=date-range-size-picker-mobile]"
        }
    },
    importRules: {
        desktop: {
            view: "[data-testid=import-rules-table-desktop]",
            item: "[data-testid=import-rules-table-row]",
            actionDelete: "[data-testid=import-rules-table-row-delete]",
            actionEdit: "[data-testid=import-rules-table-row-edit]",
            tableColumnRule: "[data-testid=import-rules-table-column-header-rule]"
        },
        mobile: {
            view: "[data-testid=import-rules-list-mobile]",
            item: "[data-testid=import-rules-list-item]",
            actionDelete: "[data-testid=list-item-delete]",
            actionEdit: "[data-testid=list-item-edit]",
            actionOverflow: "[data-testid=list-item-overflow]"
        }
    },
    navigation: {
        logoLink: "[data-testid=app-navigation-logo-link]",
        desktop: {
            container: "[data-testid=app-navigation-large]",
            accounts: `[data-testid=${navIdPrefixLarge}-Accounts]`,
            dashboard: `[data-testid=${navIdPrefixLarge}-Dashboard]`,
            transactions: `[data-testid=${navIdPrefixLarge}-Transactions]`,
            addButton: "[data-testid=global-add-button-desktop-trigger]",
            addDropdown: "[data-testid=global-add-button-desktop]",
            settingsNavigation: "[data-testid=settings-navigation-desktop]"
        },
        mobile: {
            container: "[data-testid=app-navigation-mobile]",
            accounts: `[data-testid=${navIdPrefixSmall}-Accounts]`,
            dashboard: `[data-testid=${navIdPrefixSmall}-Dashboard]`,
            settings: `[data-testid=${navIdPrefixSmall}-Settings]`,
            transactions: `[data-testid=${navIdPrefixSmall}-Transactions]`,
            addButton: "[data-testid=global-add-button-mobile-trigger]",
            addDropdown: "[data-testid=global-add-button-mobile]",
            settingsNavigation: "[data-testid=settings-navigation-mobile]"
        }
    },
    transactions: {
        list: {
            emptyList: "[data-testid=transactions-list-empty]"
        },
        searchInput: "[data-testid=transactions-search-input]",
        typeIcon: ".TransactionTypeIcon",
        typePicker: "[data-testid=transaction-type-picker]",
        typeFilters: {
            container: "[data-testid=transaction-type-filters]"
        },
        summary: {
            tabs: "[data-testid=transactions-with-summary-tabs]",
            container: "[data-testid=transactions-summary]"
        },
        desktop: {
            view: "[data-testid=transactions-table-desktop]",
            item: "[data-testid=transactions-table-row]",
            actionDelete: "[data-testid=transactions-table-row-delete]",
            actionEdit: "[data-testid=transactions-table-row-edit]",
            tableColumnDescription: "[data-testid=transactions-table-column-header-description]",
            tableColumnFrom: "[data-testid=transactions-table-column-header-from]",
            tableColumnTo: "[data-testid=transactions-table-column-header-to]"
        },
        mobile: {
            view: "[data-testid=transactions-list-mobile]",
            item: "[data-testid=transactions-list-item]",
            actionDelete: "[data-testid=list-item-delete]",
            actionEdit: "[data-testid=list-item-edit]",
            actionOverflow: "[data-testid=list-item-overflow]"
        }
    }
};
