import {DateService} from "services/";
import {AnyDate, Id, ObjectWithId, NonFunctionProperties} from "utils/types";

/** Any object that has a date and an ID. For example, a transaction object. */
interface ObjectWithDateAndId extends ObjectWithId {
    date: AnyDate;
}

// Because this data structure is used primarily by the store, we want the raw
// data as a separate type, which will be operated on by all of the static
// functions in the DateIndex class.
export type DateIndexData = NonFunctionProperties<DateIndex>;

export default class DateIndex {
    [year: number]: {
        // Note: Months are 0-indexed, since that's how JavaScript Dates represent them.
        [month: number]: {
            // Note: Days are 1-indexed, since that's how JavaScript dates represent them.
            // That is, days start at 1 and not 0.
            //
            // Also note that we can have the days be a map and still leverage them as being
            // sorted because `Object.keys` returns integer indices sorted already.
            //
            // Although strictly speaking, since `Object.keys` is O(n), it's _technically_
            // slower than if we stored the days as a fixed 31 length array, but it _should_
            // take up quite a bit less space, so the negligible performance improvements
            // are well worth the space savings.
            [day: number]: Array<Id>;
        };
    };

    constructor(dateIndex: DateIndexData) {
        // In practice, since the DateIndex is a Redux store level data structure, we won't really
        // be instantiating a 'DateIndex' object, but merely operating on the one from the store.
        // As such, the 'constructor' won't really be used.
        Object.assign(this, dateIndex);
    }

    /** Add a new ID to the index. */
    static add(dateIndex: DateIndexData, object: ObjectWithDateAndId): DateIndexData {
        const {id, date} = object;

        try {
            const {year, month, day} = DateService.deconstructDate(date);

            const ids = DateIndex.find(dateIndex, date);

            if (ids.length) {
                // Make sure we don't add duplicate IDs to the store.
                // It's fine that this is a linear scan since the number of IDs (transactions) on any
                // given day is likely to be relatively low.
                if (!ids.includes(id)) {
                    ids.push(id);
                }
            } else {
                // Need to create the initial map at each piece of the date, if it doesn't yet exist.
                if (!dateIndex[year]) {
                    dateIndex[year] = {};
                }

                if (!dateIndex[year][month]) {
                    dateIndex[year][month] = {};
                }

                if (!dateIndex[year][month][day]) {
                    // Add in the ID.
                    dateIndex[year][month][day] = [id];
                }
            }

            return dateIndex;
        } catch (e) {
            console.error(e);
            console.log({object});

            return dateIndex;
        }
    }

    /** Delete an ID from the index. */
    static delete(dateIndex: DateIndexData, id: Id): DateIndexData {
        // Since we don't pass in the full object as part of deletion operations, we have to do
        // a full index scan to find the ID and remove it. Yeah, it's bad, but since deletions
        // should be relatively rare operations, it's fine.
        //
        // We can always optimize this in the future by changing deletion operations to include
        // the full object, so that we can find the ID in constant time.
        DateIndex._iterateSubIndex(dateIndex, (year) => {
            if (DateIndex._deleteIdFromYear(dateIndex, id, year)) {
                // Return true to break out of the iteration early if we found the ID.
                return true;
            }

            return false;
        });

        return dateIndex;
    }

    /** Move an ID from one date to another in the index.
     *  Should also act as an upsert, where it inserts the ID if it doesn't yet exist. */
    static update(dateIndex: DateIndexData, object: ObjectWithDateAndId): DateIndexData {
        const {id, date} = object;

        try {
            const dateParts = DateService.deconstructDate(date);

            // Since we don't have a separate ID -> date index just for this index, we can't
            // lookup the ID's old date in constant time. However, we can use heuristics
            // to speed up the linear search of the index to find the ID. Namely, users aren't
            // likely to change the month and aren't likely to change the year, so we can check
            // those locations first.

            let foundId = false;

            // Scan the month first and hopefully find it somewhere in there.
            foundId = DateIndex._deleteIdFromMonth(dateIndex, id, dateParts.month, dateParts.year);

            // If we didn't find the ID in the month, time to search the year.
            if (!foundId) {
                foundId = DateIndex._deleteIdFromYear(dateIndex, id, dateParts.year);
            }

            // If we didn't even find the ID in the year, time to search the whole index.
            if (!foundId) {
                DateIndex._iterateSubIndex(dateIndex, (year) => {
                    if (
                        year !== dateParts.year &&
                        DateIndex._deleteIdFromYear(dateIndex, id, year)
                    ) {
                        // Return true to break out of the iteration early if we found the ID.
                        return true;
                    }

                    return false;
                });
            }

            // At this point, if the ID was not found, then it means it never existed in the store.
            // Either way, we now have to insert the ID using its new date.
            DateIndex.add(dateIndex, object);

            return dateIndex;
        } catch (e) {
            console.error(e);
            console.log({object});

            return dateIndex;
        }
    }

    /** Find all of the IDs on a given date. */
    static find(dateIndex: DateIndexData, date: AnyDate): Array<Id> {
        const {year, month, day} = DateService.deconstructDate(date);

        return dateIndex?.[year]?.[month]?.[day] ?? [];
    }

    /** Find all of the IDs between the start and end date, inclusively. */
    static findBetween(dateIndex: DateIndexData, startDate: AnyDate, endDate: AnyDate): Array<Id> {
        // Swap the dates around if the end comes before the start.
        // Just in case ¯\_(ツ)_/¯
        if (
            startDate &&
            endDate &&
            DateService.createUTCDate(startDate) > DateService.createUTCDate(endDate)
        ) {
            [startDate, endDate] = [endDate, startDate];
        }

        const resultIds: Array<Id> = [];

        const startDateParts = startDate
            ? DateService.deconstructDate(startDate)
            : {
                  // Use '0' just so every date _has_ to be bigger than it.
                  // This effectively means "take everything from the start of the index".
                  year: 0,
                  month: 0,
                  day: 0
              };

        const endDateParts = endDate
            ? DateService.deconstructDate(endDate)
            : {
                  // Use giant numbers so that every date _has_ to be smaller than it.
                  // This effectively means "take everything till the end of the index".
                  // Yes, technically this code will fail to work once we reach year... whatever.
                  // I think we'll be fine.
                  year: 10000000000000,
                  month: 10000000000000,
                  day: 10000000000000
              };

        DateIndex._iterateSubIndex(dateIndex, (year, months) => {
            // Years after/including the start year.
            if (year >= startDateParts.year) {
                return DateIndex._iterateSubIndex(months, (month, days) => {
                    if (
                        // After the start year, or...
                        year > startDateParts.year ||
                        // Months after/including the start month in the start year.
                        (year === startDateParts.year && month >= startDateParts.month)
                    ) {
                        return DateIndex._iterateSubIndex(days, (day, ids: Array<Id>) => {
                            if (
                                // After the start year, or...
                                year > startDateParts.year ||
                                // After the month in the start year, or...
                                (year === startDateParts.year && month > startDateParts.month) ||
                                // Days after/including the start day in the start month/year.
                                (year === startDateParts.year &&
                                    month === startDateParts.month &&
                                    day >= startDateParts.day)
                            ) {
                                // Only take IDs that are less than or equal to the end date.
                                if (
                                    DateService.isLessThanOrEqualDeconstructed(
                                        {year, month, day},
                                        endDateParts
                                    )
                                ) {
                                    resultIds.push(...ids);
                                    return false;
                                } else {
                                    // Otherwise, bail out cause we're done scanning.
                                    return true;
                                }
                            }
                        });
                    }
                });
            }
        });

        return resultIds;
    }

    /** Core logic is the same as `findBetween`, except we add the ability to limit including
     *  future transactions in the output. This is used with the `showFutureTransactions` preference
     *  to only show transactions up to the current day. */
    static findBetweenWithFutureLimit = (
        dateIndex: DateIndex,
        startDate: string,
        endDate: string,
        showFutureTransactions: boolean = true
    ): Array<Id> => {
        if (!showFutureTransactions) {
            const today = DateService.getTodayAsUTCString();

            const isEndDateInFuture = endDate && DateService.isLessThan(today, endDate);
            const isStartDateInFuture = startDate && DateService.isLessThan(today, startDate);

            // If both dates are in the future, then we just return an empty array.
            // Otherwise, both dates will default back to `today`, and then the returned IDs
            // will only come from today, which makes no sense.
            if (isEndDateInFuture && isStartDateInFuture) {
                return [];
            }

            // When we're not showing showing future transactions, we just limit the end date to today.
            // `!endDate` handles the "All Time" case (since `endDate = ""`)
            if (!endDate || isEndDateInFuture) {
                endDate = today;
            }

            // Need to also limit the startDate to today if it goes beyond today.
            // In practice, this doesn't really happen because `endDate` will, by definition,
            // also be in the future, unless the dates get swapped around.
            if (startDate && isStartDateInFuture) {
                startDate = today;
            }
        }

        return DateIndex.findBetween(dateIndex, startDate, endDate);
    };

    /** Finds all transactions that are after (and not including) today.
     *
     *  This is (currently) used to (partly) determine whether the 'Show Future' toggle should be displayed,
     *  since it shouldn't be shown if there aren't any future transactions. */
    static findFuture(dateIndex: DateIndexData): Array<Id> {
        const tomorrow = DateService.addDays(DateService.getTodayDate(), 1);
        return DateIndex.findBetween(dateIndex, tomorrow, "");
    }

    /** Removes a day if it no longer has any IDs.
     *  Removes a month if it no longer has days with any IDs.
     *  Removes a year if it no longer has any months that have any days with any IDs. */
    static _cleanupAfterDeletion(
        dateIndex: DateIndexData,
        year: number,
        month: number,
        day: number
    ) {
        if (dateIndex[year][month][day].length === 0) {
            delete dateIndex[year][month][day];

            if (Object.keys(dateIndex[year][month]).length === 0) {
                delete dateIndex[year][month];

                if (Object.keys(dateIndex[year]).length === 0) {
                    delete dateIndex[year];
                }
            }
        }
    }

    /** Removes the given ID from the given month in the given year. */
    static _deleteIdFromMonth(
        dateIndex: DateIndexData,
        id: Id,
        month: number,
        year: number
    ): boolean {
        if (!dateIndex?.[year]?.[month]) {
            return false;
        }

        return DateIndex._iterateSubIndex(dateIndex[year][month], (day: number, ids: Array<Id>) => {
            if (ids.includes(id)) {
                dateIndex[year][month][day] = ids.filter((dayId) => dayId !== id);

                DateIndex._cleanupAfterDeletion(dateIndex, year, month, day);
                return true;
            }

            return false;
        });
    }

    /** Removes the given ID from the given year. */
    static _deleteIdFromYear(dateIndex: DateIndexData, id: Id, year: number): boolean {
        if (!dateIndex?.[year]) {
            return false;
        }

        return DateIndex._iterateSubIndex(dateIndex[year], (month: number) => {
            return DateIndex._deleteIdFromMonth(dateIndex, id, month, year);
        });
    }

    /** Iterates over a 'sub index' (i.e. anything in the date index that maps dates to ..
     *  anything). Executes a callback for each iteration.
     *
     *  This can be used to iterate over all the years or months or days of the date index. */
    static _iterateSubIndex(
        index: {[datePiece: number]: any},
        callback: (datePiece: number, indexPiece: any) => boolean | void
    ): boolean {
        const datePieces = Object.keys(index);

        for (let i = 0; i < datePieces.length; i++) {
            const datePiece = parseInt(datePieces[i]);

            if (callback(datePiece, index[datePiece])) {
                // This is a quick bailout mechanism.
                // For example, if we've already found what we're looking for, we don't
                // need to keep going.
                return true;
            }
        }

        return false;
    }
}
