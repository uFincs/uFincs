import Papa from "papaparse";
import {CsvFileContents} from "utils/types";

export default class CsvParser {
    static parseFile(file: File): Promise<CsvFileContents> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                        reject(new Error(`Couldn't parse file; is "${file.name}" a CSV file?`));
                    } else {
                        // Remove any straggling empty rows
                        const rows = (results.data as CsvFileContents).filter(
                            (row: Array<string>) => !row.every((col: string) => !col)
                        );

                        resolve(rows);
                    }
                },
                error: (error) => reject(error)
            });
        });
    }
}
