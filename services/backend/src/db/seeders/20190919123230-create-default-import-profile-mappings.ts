import {IMPORT_PROFILE_MAPPINGS, IMPORT_PROFILE_MAPPING_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";
import {seederGenerator} from "db/utils";

export default seederGenerator(
    tableNames.IMPORT_PROFILE_MAPPINGS,
    IMPORT_PROFILE_MAPPINGS,
    IMPORT_PROFILE_MAPPING_IDS
);
