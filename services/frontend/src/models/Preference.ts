import {v4 as uuidv4} from "uuid";
import {DateService} from "services/";
import {Id, NonFunctionProperties} from "utils/types";

export interface PreferenceData extends NonFunctionProperties<Preference> {}
export interface PreferencePersistentFields extends Pick<Preference, "currency"> {}

interface PreferenceConstructor extends Omit<Preference, "createdAt" | "updatedAt"> {
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default class Preference {
    userId: Id;
    currency: string | null;

    createdAt: string;
    updatedAt: string;

    static DEFAULT_PREFERENCES = {
        currency: null
    };

    constructor({
        userId = uuidv4(),
        currency = null,
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<PreferenceConstructor> = {}) {
        this.userId = userId;
        this.currency = currency;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);
    }

    validate(): Preference {
        const {currency} = this;

        if (currency === undefined) {
            throw new Error("Missing currency");
        }

        return this;
    }

    static extractDataFields(object: any): PreferencePersistentFields {
        try {
            const {currency} = object;

            return {currency};
        } catch {
            throw new Error("Failed to extract data from preferences");
        }
    }
}
