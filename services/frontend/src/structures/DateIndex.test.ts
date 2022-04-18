// We need deep clone because the DateIndex methods directly modify the index object.
// Which is fine for Redux (since it can handle -- hopefully -- the mutations),
// but for testing, we need these objects to be consistent.
import {DateService} from "services/";
import {deepClone} from "utils/helperFunctions";
import DateIndex from "./DateIndex";

const today = DateService.getTodayDate();
const todayString = DateService.convertToUTCString(today);

const object1 = {id: "1", date: "2020-07-29"};

// An object with a completely different date.
const object2 = {id: "2", date: "2019-03-02"};

// An object with the same date as object1.
const object3 = {id: "3", date: "2020-07-29"};

// An object with the same year (but different day/month) as object1.
const object4 = {id: "4", date: "2020-04-15"};

// An object with the same month (but different day) as object1.
const object5 = {id: "5", date: "2020-07-15"};

const emptyIndex = {};

// For testing single object index.
const indexWithObject1 = {
    2020: {
        6: {
            29: [object1.id]
        }
    }
};

// For testing multiple objects on same date.
const indexWithObject1And3 = {
    2020: {
        6: {
            29: [object1.id, object3.id]
        }
    }
};

// For testing multiple objects in different months, same year.
const indexWithObject1And4 = {
    2020: {
        3: {
            15: [object4.id]
        },
        6: {
            29: [object1.id]
        }
    }
};

// For testing multiple objects on different days, same year/month.
const indexWithObject1And5 = {
    2020: {
        6: {
            15: [object5.id],
            29: [object1.id]
        }
    }
};

// For testing multiple years.
const indexWithObject2 = {
    2019: {
        2: {
            2: [object2.id]
        }
    }
};

// For testing multiple objects.
const indexWithObject1And2 = {
    ...indexWithObject1,
    ...indexWithObject2
};

/* Helper Functions */

// The following two functions are taken from: https://stackoverflow.com/a/37164538
function isObject(item: any) {
    return item && typeof item === "object" && !Array.isArray(item);
}

function deepMerge(target: Record<string, any>, source: Record<string, any>) {
    const output = Object.assign({}, target);

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target)) Object.assign(output, {[key]: source[key]});
                else output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, {[key]: source[key]});
            }
        });
    }

    return output;
}

/* Tests */

describe("add", () => {
    it("can add a new id to an empty index", () => {
        expect(DateIndex.add(deepClone(emptyIndex), object1)).toEqual(indexWithObject1);
    });

    it("can add a new id to an existing index", () => {
        expect(DateIndex.add(deepClone(indexWithObject2), object1)).toEqual(indexWithObject1And2);
    });

    it("can add an id to a date that already has ids", () => {
        expect(DateIndex.add(deepClone(indexWithObject1), object3)).toEqual(indexWithObject1And3);
    });

    it("prevents adding duplicate ids", () => {
        expect(DateIndex.add(deepClone(indexWithObject1), object1)).toEqual(indexWithObject1);
    });
});

describe("delete", () => {
    it("can remove an id from the index", () => {
        expect(DateIndex.delete(deepClone(indexWithObject1), object1.id)).toEqual(emptyIndex);
    });

    it("can remove an id from a day that has multiple ids", () => {
        expect(DateIndex.delete(deepClone(indexWithObject1And3), object3.id)).toEqual(
            indexWithObject1
        );
    });

    it("removes an entire year if the year has no more ids", () => {
        expect(DateIndex.delete(deepClone(indexWithObject1And2), object1.id)).toEqual(
            indexWithObject2
        );
    });

    it("removes an entire month if the month has no more ids", () => {
        expect(DateIndex.delete(deepClone(indexWithObject1And4), object4.id)).toEqual(
            indexWithObject1
        );
    });

    it("removes an entire day if the day has no more ids", () => {
        expect(DateIndex.delete(deepClone(indexWithObject1And5), object5.id)).toEqual(
            indexWithObject1
        );
    });

    it("doesn't do anything when trying to remove an id from an empty index", () => {
        expect(DateIndex.delete(deepClone(emptyIndex), object1.id)).toEqual(emptyIndex);
    });

    it("doesn't do anything when trying to remove an unknown id", () => {
        expect(DateIndex.delete(deepClone(indexWithObject1), object2.id)).toEqual(indexWithObject1);
    });
});

describe("update", () => {
    it("can update the date of an id", () => {
        expect(
            DateIndex.update(deepClone(indexWithObject1), {...object1, date: "2020-05-01"})
        ).toEqual({
            2020: {
                4: {
                    1: [object1.id]
                }
            }
        });
    });

    it("can update the date of an id by a single day", () => {
        // Just want to make sure we don't have any off-by-1 errors.

        expect(
            DateIndex.update(deepClone(indexWithObject1), {...object1, date: "2020-07-30"})
        ).toEqual({
            2020: {
                6: {
                    30: [object1.id]
                }
            }
        });

        expect(
            DateIndex.update(deepClone(indexWithObject1), {...object1, date: "2020-07-28"})
        ).toEqual({
            2020: {
                6: {
                    28: [object1.id]
                }
            }
        });
    });

    it("can update the date of an id to a different year", () => {
        expect(
            DateIndex.update(deepClone(indexWithObject1), {...object1, date: "2005-01-01"})
        ).toEqual({
            2005: {
                0: {
                    1: [object1.id]
                }
            }
        });
    });

    it("can add the id when it doesn't yet exist", () => {
        expect(DateIndex.update(deepClone(emptyIndex), object1)).toEqual(indexWithObject1);
    });
});

describe("find", () => {
    it("can find the set of ids at a given date", () => {
        expect(DateIndex.find(indexWithObject1, object1.date)).toEqual([object1.id]);
        expect(DateIndex.find(indexWithObject1And3, object1.date)).toEqual([
            object1.id,
            object3.id
        ]);
    });

    it("returns an empty array if it the date has no ids", () => {
        expect(DateIndex.find(indexWithObject2, object1.date)).toEqual([]);
    });
});

describe("findBetween", () => {
    it("can find the ids between two dates", () => {
        expect(DateIndex.findBetween(indexWithObject1And2, "2000-01-01", "2050-01-01")).toEqual([
            object2.id,
            object1.id
        ]);
    });

    it("can find the ids between two dates, inclusive on the start/end dates", () => {
        expect(DateIndex.findBetween(indexWithObject1And2, object2.date, "2050-01-01")).toEqual([
            object2.id,
            object1.id
        ]);

        expect(DateIndex.findBetween(indexWithObject1And2, "2000-01-01", object1.date)).toEqual([
            object2.id,
            object1.id
        ]);
    });

    it("can find the ids when the start/end date are the same", () => {
        expect(DateIndex.findBetween(indexWithObject1And3, object1.date, object1.date)).toEqual([
            object1.id,
            object3.id
        ]);
    });

    it("can handle the end date being before the start date", () => {
        expect(DateIndex.findBetween(indexWithObject1And2, "2050-01-01", "2000-01-01")).toEqual([
            object2.id,
            object1.id
        ]);
    });

    it(`takes everything from the start of the index till the end date
        when the start date is empty`, () => {
        expect(DateIndex.findBetween(indexWithObject1And2, "", "2019-12-31")).toEqual([object2.id]);
    });

    it(`takes everything from the start date till the end of the index
        when the end date is empty`, () => {
        expect(DateIndex.findBetween(indexWithObject1And2, "2020-01-01", "")).toEqual([object1.id]);
    });

    it("takes everything from the index when the start and end date are empty", () => {
        expect(DateIndex.findBetween(indexWithObject1And2, "", "")).toEqual([
            object2.id,
            object1.id
        ]);
    });

    it("can find the ids when the start/end dates are 1 day apart", () => {
        const index = {
            2020: {
                6: {
                    29: ["1"],
                    30: ["2"]
                }
            }
        };

        expect(DateIndex.findBetween(index, "2020-07-29", "2020-07-30")).toEqual(["1", "2"]);
    });

    it("can find the ids when the start/end dates are 1 month apart", () => {
        const index = {
            2020: {
                6: {
                    29: ["1"]
                },
                7: {
                    29: ["2"]
                }
            }
        };

        expect(DateIndex.findBetween(index, "2020-07-29", "2020-08-29")).toEqual(["1", "2"]);
    });

    it("can find the ids when the start/end dates are 1 year apart", () => {
        const index = {
            2020: {
                6: {
                    29: ["1"]
                }
            },
            2021: {
                6: {
                    29: ["2"]
                }
            }
        };

        expect(DateIndex.findBetween(index, "2020-07-29", "2021-07-29")).toEqual(["1", "2"]);
    });

    it("can find the ids when the start date is 1 off from a day", () => {
        const index = {
            2020: {
                6: {
                    29: ["1"]
                }
            },
            2021: {
                6: {
                    29: ["2"]
                }
            }
        };

        expect(DateIndex.findBetween(index, "2020-07-30", "2021-07-29")).toEqual(["2"]);
    });

    it("can find the ids when the end date is 1 off from a day", () => {
        const index = {
            2020: {
                6: {
                    29: ["1"]
                }
            },
            2021: {
                6: {
                    29: ["2"]
                }
            }
        };

        expect(DateIndex.findBetween(index, "2020-07-29", "2021-07-28")).toEqual(["1"]);
    });

    it("works regardless of the insertion order of the dates into the index", () => {
        const index = {
            2021: {
                9: {
                    27: ["8"],
                    15: ["7"],
                    30: ["9"]
                },
                6: {
                    30: ["6"],
                    15: ["5"],
                    1: ["4"]
                },
                10: {
                    29: ["10"],
                    30: ["11"]
                },
                3: {
                    1: ["3"],
                    // Magical empty list that shouldn't exist, but for the purposes of this test
                    // does just to prove the point that the function won't blow up if we
                    // somehow don't clean up after a deletion.
                    30: []
                }
            },
            2005: {
                12: {
                    31: ["2"]
                },
                1: {
                    1: ["1"]
                }
            }
        };

        expect(DateIndex.findBetween(index, "2000-01-01", "2050-01-01")).toEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11"
        ]);
    });
});

describe("findBetweenWithFutureLimit", () => {
    const startDate = DateService.addDays(today, 1);
    const endDate = DateService.addDays(today, 4);

    const startDateString = DateService.convertToUTCString(startDate);
    const endDateString = DateService.convertToUTCString(endDate);

    const intermediateDate1 = DateService.addDays(today, 2);
    const intermediateDate2 = DateService.addDays(today, 3);

    const todayIndex = {
        [today.getUTCFullYear()]: {
            [today.getUTCMonth()]: {
                [today.getUTCDate()]: [object1.id]
            }
        }
    };

    const startDateIndex = {
        [startDate.getUTCFullYear()]: {
            [startDate.getUTCMonth()]: {
                [startDate.getUTCDate()]: [object2.id]
            }
        }
    };

    const endDateIndex = {
        [endDate.getUTCFullYear()]: {
            [endDate.getUTCMonth()]: {
                [endDate.getUTCDate()]: [object5.id]
            }
        }
    };

    const intermediateIndex1 = {
        [intermediateDate1.getUTCFullYear()]: {
            [intermediateDate1.getUTCMonth()]: {
                [intermediateDate1.getUTCDate()]: [object3.id]
            }
        }
    };

    const intermediateIndex2 = {
        [intermediateDate2.getUTCFullYear()]: {
            [intermediateDate2.getUTCMonth()]: {
                [intermediateDate2.getUTCDate()]: [object4.id]
            }
        }
    };

    // Because the dates can have the same year/months, we need to deep merge each entry
    // to build the final index. Yes, it could be done more efficient than this; no, I don't care.
    const merge1 = deepMerge(todayIndex, startDateIndex);
    const merge2 = deepMerge(merge1, endDateIndex);
    const merge3 = deepMerge(merge2, intermediateIndex1);
    const indexWithFuture = deepMerge(merge3, intermediateIndex2);

    describe("showFutureTransactions disabled", () => {
        it("returns nothing when both start/end dates are in the future", () => {
            expect(
                DateIndex.findBetweenWithFutureLimit(
                    indexWithFuture,
                    startDateString,
                    endDateString,
                    false
                )
            ).toEqual([]);
        });

        it("sets the end date to today when the end date is in the future", () => {
            expect(
                DateIndex.findBetweenWithFutureLimit(
                    indexWithFuture,
                    todayString,
                    endDateString,
                    false
                )
            ).toEqual([object1.id]);
        });

        it("sets the start date to today when the start date is in the future", () => {
            expect(
                DateIndex.findBetweenWithFutureLimit(
                    indexWithFuture,
                    endDateString,
                    todayString,
                    false
                )
            ).toEqual([object1.id]);
        });
    });

    describe("showFutureTransactions enabled", () => {
        it("acts just like regular 'findBetween'", () => {
            expect(
                DateIndex.findBetweenWithFutureLimit(
                    indexWithFuture,
                    startDateString,
                    endDateString,
                    true
                )
            ).toEqual([object2.id, object3.id, object4.id, object5.id]);
        });
    });
});

describe("findFuture", () => {
    const todayDeconstructed = DateService.deconstructDate(today);

    const indexWithFuture = {
        2001: {
            1: {
                1: [object1.id]
            }
        },
        [todayDeconstructed.year]: {
            [todayDeconstructed.month]: {
                [todayDeconstructed.day]: [object3.id]
            }
        },
        3001: {
            1: {
                1: [object2.id]
            }
        }
    };

    it("finds future transactions", () => {
        expect(DateIndex.findFuture(indexWithFuture)).toContain(object2.id);
    });

    it("doesn't find transactions from today or the past", () => {
        expect(DateIndex.findFuture(indexWithFuture)).not.toContain(object1.id);
        expect(DateIndex.findFuture(indexWithFuture)).not.toContain(object3.id);
    });
});
