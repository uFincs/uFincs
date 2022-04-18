import {SUBSCRIPTIONS, SUBSCRIPTION_IDS} from "db/seedData.encrypted";
import tableNames from "db/tableNames";
import {seederGenerator} from "db/utils";

export default seederGenerator(tableNames.SUBSCRIPTIONS, SUBSCRIPTIONS, SUBSCRIPTION_IDS);
