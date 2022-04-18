import {ACCOUNTS, ACCOUNT_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";
import {seederGenerator} from "db/utils";

export default seederGenerator(tableNames.ACCOUNTS, ACCOUNTS, ACCOUNT_IDS);
