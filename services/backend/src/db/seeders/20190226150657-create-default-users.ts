import {USERS, USER_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";
import {seederGenerator} from "db/utils";

export default seederGenerator(tableNames.USERS, USERS, USER_IDS);
