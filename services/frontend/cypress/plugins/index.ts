// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import * as fs from "fs";
import * as path from "path";

const downloadFolder = path.join(__dirname, "..", "downloads");

export default (on: any) => {
    on("before:browser:launch", (browser: any, options: any) => {
        if (browser.family === "chromium" && browser.name !== "electron") {
            options.preferences.default["download"] = {default_directory: downloadFolder};

            return options;
        } else if (browser.family === "firefox") {
            options.preferences["browser.download.dir"] = downloadFolder;
            options.preferences["browser.download.folderList"] = 2;

            // Need to prevent download prompt for JSON files.
            options.preferences["browser.helperApps.neverAsk.saveToDisk"] = "application/json";

            return options;
        }
    });

    on("task", {
        clearDownloads() {
            fs.rmdirSync(downloadFolder, {recursive: true});
            return null;
        },
        parseDownloadedJsonFile(fileName: string) {
            return new Promise((resolve, reject) => {
                try {
                    const data = JSON.parse(
                        fs.readFileSync(path.join(downloadFolder, fileName), "utf-8")
                    );

                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        }
    });
};
