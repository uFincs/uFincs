// Note: This file is no longer used as the primary seed data.
// See seedData.encrypted.ts for an explanation.

export const USERS = [
    {
        id: "3e26fac0-7786-40f3-86bb-f175ff3d721d",
        email: "test@test.com",
        password: "$2a$10$kHbhbrZkKOvKkBeXYRsVIeuTXjlGoFq.6ndjVloax/54Nx5qMYHTq", // Password = 'test'
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const USER_IDS = USERS.map((user) => user.id);

export const PREFERENCES = [
    {
        userId: USER_IDS[0],
        currency: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const PREFERENCE_IDS = PREFERENCES.map((preference) => preference.userId);

// Static account IDs
const CHEQUING_ID = "89b52183-9064-46ea-adc5-7708512d0431";
const CASH_ID = "2707ffb9-8019-447c-8ade-3ede3b54dd83";
const SAVINGS_ID = "9056bacc-b0e5-4810-90e7-52dc15dfab5c";
const CREDIT_CARD_ID = "bd7633fc-fd35-488a-bcde-06354be7d652";
const FOOD_ID = "a0dd23c6-7b02-4b0b-8356-4d1a7395701f";
const TECH_ID = "8fb41e13-70fb-4a8e-88bf-19d19326a8bb";
const SALARY_ID = "a4bf8b8b-f368-4ed3-96ba-9ae59cf19c4f";
const INTEREST_ID = "b5136af4-5812-4915-a96b-15264bce2362";

// Static import profile IDs
const SCOTIA_BANK_CHEQUING_ID = "1857614e-ca6d-4161-8a91-93b980ef6c42";

// Account balances are stored in cents (i.e. divide by 100 to get dollars)
// Account interests are stored in millipercents (i.e. divide by 1000 to get a percentage)
export const ACCOUNTS = [
    {
        id: CHEQUING_ID,
        userId: USER_IDS[0],
        name: "Chequing",
        type: "asset",
        openingBalance: 125000,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: CASH_ID,
        userId: USER_IDS[0],
        name: "Cash",
        type: "asset",
        openingBalance: 15000,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: SAVINGS_ID,
        userId: USER_IDS[0],
        name: "Savings Account",
        type: "asset",
        openingBalance: 500000,
        interest: 2950,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: CREDIT_CARD_ID,
        userId: USER_IDS[0],
        name: "Credit Card",
        type: "liability",
        openingBalance: 0,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: FOOD_ID,
        userId: USER_IDS[0],
        name: "Food",
        type: "expense",
        openingBalance: 0,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: TECH_ID,
        userId: USER_IDS[0],
        name: "Tech",
        type: "expense",
        openingBalance: 0,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: SALARY_ID,
        userId: USER_IDS[0],
        name: "Salary",
        type: "income",
        openingBalance: 0,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: INTEREST_ID,
        userId: USER_IDS[0],
        name: "Interest",
        type: "income",
        openingBalance: 0,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const ACCOUNT_IDS = ACCOUNTS.map((account) => account.id);

// Transaction amounts are stored in cents
//
// Transaction type mappings:
//
//      income:     creditAccount = 'income',              debitAccount = 'asset'
//      expense:    creditAccount = 'expense',             debitAccount = 'asset'
//      debt:       creditAccount = 'expense',             debitAccount = 'liability',
//      transfer:   creditAccount = 'asset|liability',     debitAccount = 'asset|liability'
export const TRANSACTIONS = [
    {
        id: "557e82f4-fe27-40e7-a12f-83078a7dda0a",
        creditAccountId: CASH_ID,
        debitAccountId: FOOD_ID,
        amount: 1467,
        date: new Date("March 5, 2019 00:00:00"),
        description: "Bought some dinner",
        notes: "",
        type: "expense",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "fcd83d18-6bcc-4b27-80bc-512c54526f8d",
        creditAccountId: CHEQUING_ID,
        debitAccountId: FOOD_ID,
        amount: 5500,
        date: new Date("March 3, 2019 00:00:00"),
        description: "Went out to the pub with friends",
        notes: "",
        type: "expense",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "d47ee610-8852-4e46-bb81-2202cf440118",
        creditAccountId: CREDIT_CARD_ID,
        debitAccountId: TECH_ID,
        amount: 12999,
        date: new Date("March 2, 2019 00:00:00"),
        description: "Bought a new SSD for my desktop",
        notes: "",
        type: "debt",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "892ae69d-476c-4ec7-9e2f-5197b0dc4919",
        creditAccountId: CREDIT_CARD_ID,
        debitAccountId: TECH_ID,
        amount: 32399,
        date: new Date("March 2, 2019 00:00:00"),
        description: "Bought a Dell Ultrasharp monitor",
        notes: "",
        type: "debt",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "74db9c0b-bce5-4d87-8402-8b2b36a6b17c",
        creditAccountId: CHEQUING_ID,
        debitAccountId: TECH_ID,
        amount: 999,
        date: new Date("March 3, 2019 00:00:00"),
        description: "Got an HDMI cable for the monitor",
        notes: "",
        type: "expense",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "b061b3db-33b2-4671-b8e6-0cacb6fbe927",
        creditAccountId: SALARY_ID,
        debitAccountId: CHEQUING_ID,
        amount: 185045,
        date: new Date("March 1, 2019 00:00:00"),
        description: "Salary from company",
        notes: "",
        type: "income",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "d323751f-32a4-4947-bc09-8516ac6e457e",
        creditAccountId: SALARY_ID,
        debitAccountId: CHEQUING_ID,
        amount: 185045,
        date: new Date("February 15, 2019 00:00:00"),
        description: "Salary from company",
        notes: "",
        type: "income",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "36e7da7b-394a-4158-a356-d03b0bd5ef69",
        creditAccountId: CHEQUING_ID,
        debitAccountId: SAVINGS_ID,
        amount: 100000,
        date: new Date("February 20, 2019 00:00:00"),
        description: "Threw some money in savings",
        notes: "",
        type: "transfer",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "0075f012-7873-4552-9f91-1e552ab95283",
        creditAccountId: INTEREST_ID,
        debitAccountId: SAVINGS_ID,
        amount: 1475,
        date: new Date("February 28, 2019 00:00:00"),
        description: "Interest for February 2019",
        notes: "",
        type: "income",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const TRANSACTION_IDS = TRANSACTIONS.map((transaction) => transaction.id);

export const IMPORT_PROFILES = [
    {
        id: SCOTIA_BANK_CHEQUING_ID,
        userId: USER_IDS[0],
        name: "Scotiabank Chequing",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const IMPORT_PROFILE_IDS = IMPORT_PROFILES.map((importProfile) => importProfile.id);

export const IMPORT_PROFILE_MAPPINGS = [
    {
        id: "6d39729f-9c3a-4f1e-a472-d70be02da7a0",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "0",
        to: "date",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "a2bf0dad-b5d9-433b-b97d-4b50a2f59e11",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "1",
        to: "amount",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "f30cb709-4cb5-4fb5-a4a2-9b10f80006fd",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "2",
        to: "",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "95ca2024-2215-495e-a47d-7f56ee05ef6e",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "3",
        to: "description",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "d0ee4eb2-d7b9-4822-acfb-89b7c9e54dff",
        importProfileId: SCOTIA_BANK_CHEQUING_ID,
        from: "4",
        to: "targetAccount",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const IMPORT_PROFILE_MAPPING_IDS = IMPORT_PROFILE_MAPPINGS.map(
    (importProfileMapping) => importProfileMapping.id
);
