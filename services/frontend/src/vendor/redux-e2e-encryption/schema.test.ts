import {EncryptionSchema, PayloadApplier} from "./schema";

describe("Action Wrappers", () => {
    const baseAction = {type: "test", payload: {hello: "world"}};
    const payloadFormat = EncryptionSchema.single("thing");

    describe("wrapActionForDecryption", () => {
        it("can add the 'decrypt' meta tag to an action", () => {
            const wrappedAction = EncryptionSchema.wrapActionForDecryption(
                baseAction,
                payloadFormat
            );

            expect(wrappedAction.type).toEqual(baseAction.type);
            expect(wrappedAction.payload).toEqual(baseAction.payload);

            expect(wrappedAction.meta.decrypt).toEqual(payloadFormat);
        });

        it("preserves the action's existing meta tags", () => {
            const wrappedAction = EncryptionSchema.wrapActionForDecryption(
                {...baseAction, meta: {test: "123"}},
                payloadFormat
            );

            expect(wrappedAction.meta.test).toEqual("123");
        });
    });

    describe("wrapActionForEncryption", () => {
        it("can add the 'encrypt' meta tag to an action", () => {
            const wrappedAction = EncryptionSchema.wrapActionForEncryption(
                baseAction,
                payloadFormat
            );

            expect(wrappedAction.type).toEqual(baseAction.type);
            expect(wrappedAction.payload).toEqual(baseAction.payload);

            expect(wrappedAction.meta.encrypt).toEqual(payloadFormat);
        });

        it("preserves the action's existing meta tags", () => {
            const wrappedAction = EncryptionSchema.wrapActionForEncryption(
                {...baseAction, meta: {test: "123"}},
                payloadFormat
            );

            expect(wrappedAction.meta.test).toEqual("123");
        });
    });
});

describe("validateSchema", () => {
    it("can validate valid schemas", () => {
        const basicSchema = {
            account: {
                name: "string",
                balance: "integer"
            }
        };

        const schemaWithNestedModel = {
            account: {
                name: "string",
                balance: "integer"
            },
            transaction: {
                amount: "integer",
                description: "string",
                account: "account"
            }
        };

        const arraySchema = {
            transaction: {
                amount: "integer",
                description: "string",
                tags: ["string"],
                things: ["integer"]
            }
        } as const;
        // ^ Need const so that Typescript knows the arrays are a single element, and not a generic array.

        const arraySchemaWithModel = {
            account: {
                name: "string",
                transactions: ["transaction"]
            },
            transaction: {
                amount: "integer",
                description: "string"
            }
        } as const;

        const recursiveSchema = {
            transaction: {
                amount: "integer",
                description: "string",
                thing: "transaction"
            }
        };

        expect(() => EncryptionSchema.validateSchema(basicSchema)).not.toThrow();
        expect(() => EncryptionSchema.validateSchema(schemaWithNestedModel)).not.toThrow();
        expect(() => EncryptionSchema.validateSchema(arraySchema)).not.toThrow();
        expect(() => EncryptionSchema.validateSchema(arraySchemaWithModel)).not.toThrow();
        expect(() => EncryptionSchema.validateSchema(recursiveSchema)).not.toThrow();
    });

    it("throws an error for invalid schemas", () => {
        const wrongFieldTypes = {
            account: {
                name: "text",
                balance: "number"
            }
        };

        const wrongModelFormat = {
            account: ["name", "balance"]
        };

        const wrongModelFormat2 = {
            account: "name"
        };

        const wrongSchemaFormat = ["account"];

        const moreThanOneElementInArray = {
            account: {
                name: "string",
                things: ["string", "integer"]
            }
        } as const;

        expect(() => EncryptionSchema.validateSchema(wrongFieldTypes)).toThrow();

        // @ts-expect-error Allow invalid schema.
        expect(() => EncryptionSchema.validateSchema(wrongModelFormat)).toThrow();

        // @ts-expect-error Allow invalid schema.
        expect(() => EncryptionSchema.validateSchema(wrongModelFormat2)).toThrow();

        // @ts-expect-error Allow invalid schema.
        expect(() => EncryptionSchema.validateSchema(wrongSchemaFormat)).toThrow();

        // @ts-expect-error Allow invalid schema.
        expect(() => EncryptionSchema.validateSchema(moreThanOneElementInArray)).toThrow();
    });
});

describe("PayloadApplier", () => {
    describe("applyToPayload", () => {
        const payloadApplier = new PayloadApplier({
            transaction: {
                date: "string",
                description: "string"
            }
        });

        const instance = {
            id: "123",
            date: "a",
            description: "b"
        };

        const arrayPayload = [instance, instance];

        const mapPayload = {
            [instance.id]: instance,
            [instance.id]: instance
        };

        const functionToApply = async (field: string) => `${field}c`;

        const appliedInstance = {
            ...instance,
            date: `${instance.date}c`,
            description: `${instance.description}c`
        };

        describe("Payload Shapes", () => {
            it("can apply a function to a single payload", async () => {
                const result = await payloadApplier.applyToPayload(
                    instance,
                    EncryptionSchema.single("transaction"),
                    functionToApply
                );

                expect(result).toEqual(appliedInstance);
            });

            it("can apply a function to an array payload", async () => {
                const result = await payloadApplier.applyToPayload(
                    arrayPayload,
                    EncryptionSchema.arrayOf("transaction"),
                    functionToApply
                );

                expect(result).toEqual([appliedInstance, appliedInstance]);
            });

            it("can apply a function to a map payload", async () => {
                const result = await payloadApplier.applyToPayload(
                    mapPayload,
                    EncryptionSchema.mapOf("transaction"),
                    functionToApply
                );

                expect(result).toEqual({
                    [instance.id]: appliedInstance,
                    [instance.id]: appliedInstance
                });
            });
        });

        describe("Field Type Handling", () => {
            it("can apply to fields that are other models in the schema", async () => {
                const tempApplier = new PayloadApplier({
                    account: {
                        name: "string"
                    },
                    transaction: {
                        date: "string",
                        description: "string",
                        account: "account"
                    }
                });

                const transaction = {
                    date: "a",
                    description: "b",
                    account: {
                        name: "d"
                    }
                };

                const result = await tempApplier.applyToPayload(
                    transaction,
                    EncryptionSchema.single("transaction"),
                    functionToApply
                );

                expect(result).toEqual({
                    date: "ac",
                    description: "bc",
                    account: {
                        name: "dc"
                    }
                });
            });

            it("can apply to fields that are arrays", async () => {
                const tempApplier = new PayloadApplier({
                    account: {
                        name: "string",
                        transactions: ["transaction"]
                    },
                    transaction: {
                        amount: "integer",
                        description: "string",
                        tags: ["string"]
                    }
                });

                const account = {
                    name: "a",
                    transactions: [
                        {
                            amount: 1,
                            description: "b",
                            tags: ["d", "e"]
                        },
                        {
                            amount: 2,
                            description: "f",
                            tags: ["g", "h"]
                        }
                    ]
                };

                const result = await tempApplier.applyToPayload(
                    account,
                    EncryptionSchema.single("account"),
                    functionToApply
                );

                expect(result).toEqual({
                    name: "ac",
                    transactions: [
                        {
                            amount: "1c",
                            description: "bc",
                            tags: ["dc", "ec"]
                        },
                        {
                            amount: "2c",
                            description: "fc",
                            tags: ["gc", "hc"]
                        }
                    ]
                });
            });

            it("can apply to fields that are recursive on themselves", async () => {
                const tempApplier = new PayloadApplier({
                    transaction: {
                        amount: "integer",
                        description: "string",
                        transactions: ["transaction"]
                    }
                });

                const transaction = {
                    amount: 1,
                    description: "a",
                    transactions: [
                        {
                            amount: 2,
                            description: "b",
                            transactions: [
                                {
                                    amount: 4,
                                    description: "e"
                                }
                            ]
                        },
                        {
                            amount: 3,
                            description: "d",
                            transactions: [
                                {
                                    amount: 5,
                                    description: "f"
                                }
                            ]
                        }
                    ]
                };

                const result = await tempApplier.applyToPayload(
                    transaction,
                    EncryptionSchema.single("transaction"),
                    functionToApply
                );

                expect(result).toEqual({
                    amount: "1c",
                    description: "ac",
                    transactions: [
                        {
                            amount: "2c",
                            description: "bc",
                            transactions: [
                                {
                                    amount: "4c",
                                    description: "ec"
                                }
                            ]
                        },
                        {
                            amount: "3c",
                            description: "dc",
                            transactions: [
                                {
                                    amount: "5c",
                                    description: "fc"
                                }
                            ]
                        }
                    ]
                });
            });
        });

        describe("Error Handling", () => {
            it("throws an error when the payload is null", async () => {
                await expect(
                    payloadApplier.applyToPayload(
                        // @ts-expect-error Allow passing null for payload.
                        null,
                        EncryptionSchema.single("transaction"),
                        functionToApply
                    )
                ).rejects.toThrow();
            });

            it("throws an error when the payload format is null", async () => {
                await expect(
                    payloadApplier.applyToPayload(instance, "", functionToApply)
                ).rejects.toThrow();
            });

            it("throws an error when the model isn't in the schema", async () => {
                await expect(
                    payloadApplier.applyToPayload(
                        instance,
                        EncryptionSchema.single("unknown"),
                        functionToApply
                    )
                ).rejects.toThrow();
            });

            it("throws an error when the payload doesn't match the format", async () => {
                const configs = [
                    // Single shape.
                    [arrayPayload, EncryptionSchema.single("transaction")],
                    [123, EncryptionSchema.single("transaction")],

                    // Array shape.
                    [instance, EncryptionSchema.arrayOf("transaction")],
                    [mapPayload, EncryptionSchema.arrayOf("transaction")],
                    [123, EncryptionSchema.arrayOf("transaction")],

                    // Map shape.
                    [instance, EncryptionSchema.mapOf("transaction")],
                    [arrayPayload, EncryptionSchema.mapOf("transaction")],
                    [123, EncryptionSchema.mapOf("transaction")]
                ];

                for (const config of configs) {
                    await expect(
                        payloadApplier.applyToPayload(
                            // @ts-expect-error Allow invalid values.
                            config[0],
                            config[1],
                            functionToApply
                        )
                    ).rejects.toThrow();
                }
            });
        });
    });

    describe("convertStringsToTypes", () => {
        const payloadApplier = new PayloadApplier({
            recurringTransaction: {
                description: "string",
                neverEnds: "boolean"
            },
            transaction: {
                amount: "integer",
                description: "string"
            }
        });

        it("can convert all fields that are 'integers' in the schema to integers", async () => {
            const transactionPayload = [
                {amount: "123", description: "abc"},
                {amount: "456", description: "def"}
            ];

            const result = await payloadApplier.convertStringsToTypes(
                transactionPayload,
                EncryptionSchema.arrayOf("transaction")
            );

            expect(result).toEqual([
                {amount: 123, description: "abc"},
                {amount: 456, description: "def"}
            ]);
        });

        it("can convert all fields that are 'booleans' in the schema to booleans", async () => {
            const recurringTransactionPayload = [
                {description: "abc", neverEnds: "true"},
                {description: "def", neverEnds: "false"}
            ];

            const result = await payloadApplier.convertStringsToTypes(
                recurringTransactionPayload,
                EncryptionSchema.arrayOf("recurringTransaction")
            );

            expect(result).toEqual([
                {description: "abc", neverEnds: true},
                {description: "def", neverEnds: false}
            ]);
        });

        it("can convert all fields that are 'null' to null", async () => {
            const nullPayload = [{description: "null", neverEnds: "null"}];

            const result = await payloadApplier.convertStringsToTypes(
                nullPayload,
                EncryptionSchema.arrayOf("recurringTransaction")
            );

            expect(result).toEqual([{description: null, neverEnds: false}]);
        });
    });
});
