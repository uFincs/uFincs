import CsvParser from "./CsvParser";

describe("CsvParser", () => {
    const fileName = "filename.csv";

    it("can successfully parse a file to a 2D array", async () => {
        const csvRows = ["1,2,3,4\n", "a,b,c,d\n"];
        const parsedRows = [
            ["1", "2", "3", "4"],
            ["a", "b", "c", "d"]
        ];

        const file = new File(csvRows, fileName);
        const rows = await CsvParser.parseFile(file);

        expect(rows).toEqual(parsedRows);
    });

    it("can ignore and remove empty lines", async () => {
        const csvRows = ["1,2,3,4\n", "\n", "\n"];
        const parsedRows = [["1", "2", "3", "4"]];

        const file = new File(csvRows, fileName);
        const rows = await CsvParser.parseFile(file);

        expect(rows).toEqual(parsedRows);
    });

    it("can throw an error when parsing an invalid file object", async () => {
        try {
            // @ts-expect-error Allow testing invalid values.
            await CsvParser.parseFile(["test"]);
        } catch (e) {
            expect(e).toEqual(expect.anything());
        }
    });

    it("can throw an error when parsing an invalid CSV file", async () => {
        try {
            // eslint-disable-next-line quotes
            const file = new File(['a,"b,c\nd,e,f'], fileName);
            await CsvParser.parseFile(file);
        } catch (e) {
            expect(e).toEqual(expect.anything());
        }
    });
});
