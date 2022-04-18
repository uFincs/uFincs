const STRING_FIELD = "string";
const INTEGER_FIELD = "integer";
const BOOLEAN_FIELD = "boolean";

const FIELD_TYPES = [STRING_FIELD, INTEGER_FIELD, BOOLEAN_FIELD];

type StringField = typeof STRING_FIELD;
type IntegerField = typeof INTEGER_FIELD;
type BooleanField = typeof BOOLEAN_FIELD;
type ModelField = string;

type ArrayField =
    | readonly [StringField | IntegerField | BooleanField | ModelField]
    | [StringField | IntegerField | BooleanField | ModelField];

export type FieldsSchema = Record<
    string,
    Record<string, StringField | IntegerField | BooleanField | ModelField | ArrayField>
>;

/* Payload Shape */

// The "payload shape" specifies what form the payload (must) be in.
// It can either be a single model instance, an array of instances, or a map of instances.
//
// The shape is just the first half of the "payload format", which is the following:
// `${shape}-${model}`.
//
// The model is the name of a model that is specified in the schema that is passed in to
// encryption middleware upon creation.

export const PAYLOAD_SHAPE = {
    SINGLE: "single",
    ARRAY: "array",
    MAP: "map"
};

// The following three functions are end-user functions for specifying the payload format
// of an action. For example, an action might look like this:
//
// {
//     type: "...",
//     meta: {
//         encrypt: EncryptionSchema.arrayOf("transaction")
//     },
//     payload: {...}
// }

const single = (model: string): string => {
    return `${PAYLOAD_SHAPE.SINGLE}-${model}`;
};

const arrayOf = (model: string): string => {
    return `${PAYLOAD_SHAPE.ARRAY}-${model}`;
};

const mapOf = (model: string): string => {
    return `${PAYLOAD_SHAPE.MAP}-${model}`;
};

// The following two functions handle adding the actual meta tags to an action.
// This way, consumers don't need to deal with wrapping the object themselves.

const wrapActionForEncryption = <T extends Object & {meta?: any}>(
    action: T,
    payloadFormat: string
): T & {meta: {encrypt: string}} => {
    return {
        ...action,
        meta: {
            ...action?.meta,
            encrypt: payloadFormat
        }
    };
};

const wrapActionForDecryption = <T extends Object & {meta?: any}>(
    action: T,
    payloadFormat: string
): T & {meta: {decrypt: string}} => {
    return {
        ...action,
        meta: {
            ...action?.meta,
            decrypt: payloadFormat
        }
    };
};

/** Validates a schema to make sure it only uses the accepted field values. */
const validateSchema = (schema: FieldsSchema): void => {
    const errorMessage = `Invalid schema: ${JSON.stringify(schema)}`;

    if (Array.isArray(schema) || typeof schema !== "object") {
        throw new Error(errorMessage);
    }

    for (const model in schema) {
        const fields = schema[model];

        if (Array.isArray(fields) || typeof fields !== "object") {
            throw new Error(errorMessage);
        }

        for (const fieldName of Object.keys(fields)) {
            const fieldType = fields[fieldName];

            if (Array.isArray(fieldType)) {
                if (fieldType.length !== 1) {
                    throw new Error(errorMessage);
                } else {
                    if (FIELD_TYPES.includes(fieldType[0])) {
                        continue;
                    } else if (fieldType[0] in schema) {
                        continue;
                    } else {
                        throw new Error(errorMessage);
                    }
                }
            } else if (FIELD_TYPES.includes(fieldType as string)) {
                continue;
            } else if ((fieldType as string) in schema) {
                // Need `as string` above because, for some reason, Array.isArray doesn't narrow down
                // the type when dealing with readonly arrays.
                // For reference: https://github.com/microsoft/TypeScript/issues/17002.
                continue;
            } else {
                throw new Error(errorMessage);
            }
        }
    }
};

export const EncryptionSchema = {
    single,
    arrayOf,
    mapOf,
    validateSchema,
    wrapActionForDecryption,
    wrapActionForEncryption
};

/** Splits a payload format into the individual shape/model components. */
export const parsePayloadFormat = (payloadFormat: string): {shape: string; model: string} => {
    const [shape, model] = payloadFormat.split("-");
    return {shape, model};
};

/* Payload Manipulation */

type RawFieldValue = string | number | boolean | null;
type FieldValue = RawFieldValue | {[key: string]: RawFieldValue | FieldValue} | Array<FieldValue>;
type ModelInstance = Record<string, FieldValue>;

type SinglePayload = ModelInstance;
type ArrayPayload = Array<ModelInstance>;
type MapPayload = Record<string, ModelInstance>;

type Payload = SinglePayload | ArrayPayload | MapPayload;
type FieldMapper = (fieldValue: string, field: string) => Promise<RawFieldValue>;

/** Class that uses the schema provided to the middleware to apply transformations to an
 *  action's payload. */
export class PayloadApplier {
    schema: FieldsSchema;

    constructor(schema: FieldsSchema) {
        this.schema = schema;
    }

    /** Converts strings to the given types of the schema.
     *
     *  Used as a post-processing step after, e.g., decrypting a bunch of data. */
    public async convertStringsToTypes(payload: Payload, payloadFormat: string) {
        const {model} = parsePayloadFormat(payloadFormat);

        const convertToType = async (fieldValue: string, field: string) => {
            const fieldType = this.schema?.[model]?.[field];

            if (fieldType === INTEGER_FIELD) {
                return parseInt(fieldValue);
            } else if (fieldType === BOOLEAN_FIELD) {
                return fieldValue === "true" ? true : false;
            } else {
                return fieldValue === "null" ? null : fieldValue;
            }
        };

        return this.applyToPayload(payload, payloadFormat, convertToType);
    }

    /** Applies the given function to each field of the given payload, based on the instantiated
     *  schema. Is used to encrypt each individual field of an object/set of objects. */
    public async applyToPayload(
        payload: Payload,
        payloadFormat: string,
        functionToApply: FieldMapper
    ): Promise<Payload> {
        const {shape, model} = parsePayloadFormat(payloadFormat);

        if (!shape || !model) {
            throw new Error(`Payload format '${payloadFormat}' is invalid.`);
        } else if (!(model in this.schema)) {
            throw new Error(
                `Payload format '${payloadFormat}' is invalid: model '${model}' is not part of the schema.`
            );
        }

        switch (shape) {
            case PAYLOAD_SHAPE.SINGLE:
                return this._applyToSinglePayload(payload as SinglePayload, model, functionToApply);
            case PAYLOAD_SHAPE.ARRAY:
                return this._applyToArrayPayload(payload as ArrayPayload, model, functionToApply);
            case PAYLOAD_SHAPE.MAP:
                return this._applyToMapPayload(payload as MapPayload, model, functionToApply);
            default:
                throw new Error(
                    `Payload format '${payloadFormat}' is invalid: '${shape}' should be one of ` +
                        `'${PAYLOAD_SHAPE.SINGLE}', '${PAYLOAD_SHAPE.ARRAY}', or '${PAYLOAD_SHAPE.MAP}'.`
                );
        }
    }

    private async _applyToSinglePayload(
        payload: SinglePayload,
        model: string,
        functionToApply: FieldMapper
    ): Promise<SinglePayload> {
        if (!payload || typeof payload !== "object") {
            throw new Error(
                `Payload '${JSON.stringify(payload)}' is not an object ` +
                    "when it was specified as a single instance."
            );
        } else if (Array.isArray(payload)) {
            throw new Error(
                `Payload '${JSON.stringify(payload)}' is an array ` +
                    "when it was specified as a single instance."
            );
        }

        const payloadCopy = deepClone(payload);
        const fields = this.schema[model];

        for (const fieldName of Object.keys(fields)) {
            if (fieldName in payloadCopy) {
                const fieldType = fields[fieldName];
                let value = payloadCopy[fieldName];

                if (Array.isArray(fieldType) && fieldType.length === 1) {
                    if (FIELD_TYPES.includes(fieldType[0])) {
                        value = value as Array<RawFieldValue>;
                        const valueCopy = deepClone(value as Array<RawFieldValue>);

                        for (let i = 0; i < value.length; i++) {
                            valueCopy[i] = await functionToApply(`${value[i]}`, fieldName);
                        }

                        payloadCopy[fieldName] = valueCopy;
                    } else if (fieldType[0] in this.schema) {
                        payloadCopy[fieldName] = await this._applyToArrayPayload(
                            value as ArrayPayload,
                            fieldType[0],
                            functionToApply
                        );
                    } else {
                        throw new Error(`Invalid schema: ${JSON.stringify(this.schema)}`);
                    }
                } else if (FIELD_TYPES.includes(fieldType as string)) {
                    payloadCopy[fieldName] = await functionToApply(`${value}`, fieldName);
                } else if ((fieldType as string) in this.schema) {
                    // Need `as string` here because, for some reason, Array.isArray doesn't narrow down
                    // the type when dealing with readonly arrays.
                    // For reference: https://github.com/microsoft/TypeScript/issues/17002.

                    payloadCopy[fieldName] = await this._applyToSinglePayload(
                        value as SinglePayload,
                        fieldType as string,
                        functionToApply
                    );
                } else {
                    throw new Error(`Invalid schema: ${JSON.stringify(this.schema)}`);
                }
            }
        }

        return payloadCopy;
    }

    private async _applyToArrayPayload(
        payload: ArrayPayload,
        model: string,
        functionToApply: FieldMapper
    ): Promise<ArrayPayload> {
        if (!Array.isArray(payload)) {
            throw new Error(
                `Payload '${JSON.stringify(payload)} is not an array ` +
                    "when it was specified as an array."
            );
        }

        const appliedPayload: ArrayPayload = [];

        for (let i = 0; i < payload.length; i++) {
            appliedPayload[i] = await this._applyToSinglePayload(
                payload[i],
                model,
                functionToApply
            );
        }

        return appliedPayload;
    }

    private async _applyToMapPayload(
        payload: MapPayload,
        model: string,
        functionToApply: FieldMapper
    ): Promise<MapPayload> {
        if (!payload || typeof payload !== "object") {
            throw new Error(
                `Payload '${JSON.stringify(payload)}' is not a map when it was specified as a map.`
            );
        } else if (Array.isArray(payload)) {
            throw new Error(
                `Payload '${JSON.stringify(payload)}' is an array when it was specified as a map.`
            );
        }

        const appliedPayload: MapPayload = {};

        for (const key in payload) {
            appliedPayload[key] = await this._applyToSinglePayload(
                payload[key],
                model,
                functionToApply
            );
        }

        return appliedPayload;
    }
}

/* Helper Functions */

const deepClone = <T>(object: T): T => JSON.parse(JSON.stringify(object));
