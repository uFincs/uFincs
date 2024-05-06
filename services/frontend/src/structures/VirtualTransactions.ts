import {v4 as uuidv4} from "uuid";
import {RecurringTransaction, RecurringTransactionData, TransactionData} from "models/";
import {DateService} from "services/";
import {AnyDate, Id, NonFunctionProperties} from "utils/types";

export type VirtualTransactionsData = NonFunctionProperties<VirtualTransactions>;

/** This data structure is used for caching the realized transaction that come from viewing
 *  recurring transactions in the future. That is, "realized future transaction" = "virtual transaction".
 *
 *  We need this cache primarily for 2 reasons: 1. we need to be able to select the realized
 *  transactions out of the store by ID (for e.g. `TransactionsListItem`) and 2. because it speeds up
 *  re-querying already realized date ranges. */
export default class VirtualTransactions {
    byId: {
        [id: string]: TransactionData;
    };

    byRecurringTransactionId: {
        [id: string]: {
            [date: string]: Id;
        };
    };

    constructor({byId = {}, byRecurringTransactionId = {}}: Partial<VirtualTransactionsData> = {}) {
        this.byId = byId;
        this.byRecurringTransactionId = byRecurringTransactionId;
    }

    /** 'Adding' to the structure is basically the operation that happens when realizing a
     *  RecurringTransaction over a given date range, so that we can display the virtual
     *  transactions to the user.
     *
     *  That is why we also return the list of transactions that have been realized over the date range;
     *  this operation (unintuitively) also acts as a `findBetween`. The reason we have to do this
     *  is because it's easier/more optimal to get the list of realized transactions at creation time
     *  rather than querying for them separately.
     *
     *  If we wanted to query for them separately, we'd need a third top-level date index. */
    public static add(
        virtualTransactions: VirtualTransactionsData,
        recurringTransaction: RecurringTransactionData,
        startDate: AnyDate,
        endDate: AnyDate
    ): VirtualTransactionsData {
        // The first condition handles the currently unused case where startDate is specified but
        // not endDate.
        //
        // The second condition handles when the date range is "All Time" (that is, start/endDate are empty).
        // Since virtual (i.e. future) transactions don't apply to "All Time", don't change anything.
        if (!endDate || (!startDate && !endDate)) {
            return virtualTransactions;
        }

        // Although we allow specifying startDate as an argument, in practice, we actually always
        // need the startDate to be the startDate of the recurring transaction itself, rather than
        // that of the date range.
        //
        // This is because we need to realize all transactions between the start
        // of the recurring transaction and the endDate. And we need to do that to handle the case
        // where a user jumps forward into a future date range (e.g. by manually picking the dates),
        // without going through the intermediate date ranges. If we don't do this, then the accumulative
        // calculations (e.g. for asset/liability balances) will be incorrect, since the intermediate
        // virtual transactions wouldn't have been generated.
        //
        // As such, although the `VirtualTransactions` structure itself supports arbitrary start/endDates,
        // the burden of ensuring the startDate is empty is pushed onto the virtualTransactions reducer
        // that calls `add` or `addMany`.
        startDate = startDate ? startDate : recurringTransaction.startDate;

        const {id, creditAccountId, debitAccountId, amount, description, notes, type} =
            recurringTransaction;

        const dates = RecurringTransaction.getFutureDatesBetween(
            recurringTransaction,
            startDate,
            endDate
        );

        const createdAt = DateService.convertToTimestamp(DateService.getTodayDateTime());
        const updatedAt = createdAt;

        for (const dateObject of dates) {
            const date = DateService.convertToUTCString(dateObject);
            const realizedTransactions = virtualTransactions.byRecurringTransactionId?.[id];

            if (!realizedTransactions) {
                virtualTransactions.byRecurringTransactionId[id] = {};
            }

            const transactionId = virtualTransactions.byRecurringTransactionId?.[id]?.[date];

            if (!transactionId) {
                // Create the transaction objects manually instead of using `RecurringTransaction.realize`
                // so that we can get around the overhead of calling the Transaction constructor
                // a billion times. Really, this just removes the overhead of calling the underlying
                // date functions a bunch, but it's a noticeable improvement
                // (~250ms -> ~180ms for `addMany` when operating on 80 years with 4 recurring transactions).
                //
                // Note: A consequence of doing this is that the `date` is now in UTC string format
                // (i.e. ISO), instead of the usual timestamp format. This doesn't really break anything,
                // and in fact acts as a fairly decent optimization down-the-line for some of the
                // calculations that use the date (since they almost all use UTC string format anyways),
                // so there's one less conversion that has to be made.
                //
                // Honestly, probably should have just used UTC string format as the canonical date format
                // to begin with, but kinda late at this point...
                //
                // Side note: I can definitely see this being something is forgotten about and not changed
                // when future Transaction changes are made. So I'll just leave a `new Transaction()` here
                // so that this'll show up when doing code searches.
                const transaction = {
                    isVirtual: true,
                    id: uuidv4(),
                    creditAccountId,
                    debitAccountId,
                    recurringTransactionId: id,
                    amount,
                    date,
                    description,
                    notes,
                    type,
                    createdAt,
                    updatedAt
                };

                virtualTransactions.byId[transaction.id] = transaction;
                virtualTransactions.byRecurringTransactionId[id][date] = transaction.id;
            }
        }

        return virtualTransactions;
    }

    /** Adds many recurring transactions to structure at once. */
    public static addMany(
        virtualTransactions: VirtualTransactionsData,
        recurringTransactions: Array<RecurringTransactionData>,
        startDate: AnyDate,
        endDate: AnyDate
    ): VirtualTransactionsData {
        for (const recurringTransaction of recurringTransactions) {
            virtualTransactions = VirtualTransactions.add(
                virtualTransactions,
                recurringTransaction,
                startDate,
                endDate
            );
        }

        return virtualTransactions;
    }

    /** When a RecurringTransaction is deleted, its corresponding virtual transactions must also
     *  be deleted. */
    public static delete(
        virtualTransactions: VirtualTransactionsData,
        recurringTransactionId: Id
    ): VirtualTransactionsData {
        const transactionIds = VirtualTransactions._findIdsForRecurringTransaction(
            virtualTransactions,
            recurringTransactionId
        );

        for (const id of transactionIds) {
            if (id in virtualTransactions.byId) {
                delete virtualTransactions.byId[id];
            }
        }

        if (recurringTransactionId in virtualTransactions.byRecurringTransactionId) {
            delete virtualTransactions.byRecurringTransactionId[recurringTransactionId];
        }

        return virtualTransactions;
    }

    /** When a RecurringTransaction is updated (e.g. its schedule has changed), the only thing that
     *  (currently) matters as far as the VirtualTransactions are concerned is to remove all of the
     *  virtual transactions that were generated from the RecurringTransaction.
     *
     *  In essence, it is no different from `delete`, but this could change in the future.
     *
     *  The reason we don't need to do anything else is that `add` will handle re-generating the virtual
     *  transactions for the updated RecurringTransaction. */
    public static update(
        virtualTransactions: VirtualTransactionsData,
        recurringTransaction: RecurringTransactionData
    ): VirtualTransactionsData {
        const {id} = recurringTransaction;
        return VirtualTransactions.delete(virtualTransactions, id);
    }

    /** Given a set of recurring transactions, find all of the virtual transactions that have already been
     *  realized for them between the given start/end dates. */
    public static findBetween(
        virtualTransactions: VirtualTransactionsData,
        recurringTransactions: Array<RecurringTransactionData>,
        startDate: AnyDate,
        endDate: AnyDate
    ): Array<TransactionData> {
        // The first condition handles the currently unused case where startDate is specified but
        // not endDate.
        //
        // The second condition handles when the date range is "All Time" (that is, start/endDate are empty).
        // Since virtual (i.e. future) transactions don't apply to "All Time", just send back nothing.
        if (!endDate || (!startDate && !endDate)) {
            return [];
        }

        const transactions = [];

        for (const recurringTransaction of recurringTransactions) {
            const {id} = recurringTransaction;

            const dates = RecurringTransaction.getFutureDatesBetween(
                recurringTransaction,
                // There is a use case where only the endDate is specified — this happens when calculating
                // account balances for assets/liabilities, since their balances are accumulative.
                //
                // As such, we need to get all the virtual transactions since the recurring transaction
                // started, until the specified endDate.
                startDate ? startDate : recurringTransaction.startDate,
                endDate
            );

            for (const dateObject of dates) {
                const date = DateService.convertToUTCString(dateObject);
                const transactionId = virtualTransactions.byRecurringTransactionId?.[id]?.[date];

                if (transactionId) {
                    transactions.push(virtualTransactions.byId[transactionId]);
                }
            }
        }

        return transactions;
    }

    public static _findIdsForRecurringTransaction(
        virtualTransactions: VirtualTransactionsData,
        recurringTransactionId: Id
    ): Array<string> {
        if (recurringTransactionId in virtualTransactions.byRecurringTransactionId) {
            return Object.values(
                virtualTransactions.byRecurringTransactionId[recurringTransactionId]
            );
        } else {
            return [];
        }
    }
}
