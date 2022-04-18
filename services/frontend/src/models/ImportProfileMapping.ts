import {v4 as uuidv4} from "uuid";
import {DateService} from "services/";
import {Id, NonFunctionProperties} from "utils/types";

export type ImportProfileMappingField =
    | "targetAccount"
    | "amount"
    | "date"
    | "description"
    | "type"
    | "";

export interface ImportProfileMappingData extends NonFunctionProperties<ImportProfileMapping> {}

export default class ImportProfileMapping {
    id: Id;
    importProfileId: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    // The column (a number as a string) of the CSV file.
    from: string;

    // One of MAPPABLE_FIELDS.
    to: ImportProfileMappingField;

    static MAPPABLE_FIELDS: readonly ImportProfileMappingField[] = [
        "targetAccount",
        "amount",
        "date",
        "description",
        "type"
    ] as const;

    constructor({
        id = uuidv4(),
        importProfileId = "",
        from = "",
        to = "",
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<ImportProfileMapping> = {}) {
        this.id = id;
        this.importProfileId = importProfileId;

        this.from = from;
        this.to = to;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);
    }

    static extractDataFields(object: any): ImportProfileMappingData {
        try {
            const {id, importProfileId, from, to, createdAt, updatedAt} = object;

            return {id, importProfileId, from, to, createdAt, updatedAt};
        } catch {
            throw new Error("Failed to extract data from import profile mapping");
        }
    }
}
