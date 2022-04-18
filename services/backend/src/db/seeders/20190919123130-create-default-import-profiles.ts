import {IMPORT_PROFILES, IMPORT_PROFILE_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";
import {seederGenerator} from "db/utils";

export default seederGenerator(tableNames.IMPORT_PROFILES, IMPORT_PROFILES, IMPORT_PROFILE_IDS);
