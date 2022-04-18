import {TRANSACTIONS, TRANSACTION_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";
import {seederGenerator} from "db/utils";

export default seederGenerator(tableNames.TRANSACTIONS, TRANSACTIONS, TRANSACTION_IDS);
