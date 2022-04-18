# Database Stuff

This is everything for connecting to and configuring the Postgres database that backs the Backend. We use Sequelize as the ORM.

```
├── config/                 # Config for connecting to the database.
├── database.ts             # Initialization for the Sequelize client
├── foreignKeys.ts          # All of the foreign key mappings between the tables. Need this separate since it's shared.
├── migrations/             # All of the schema migrations since the beginning of time.
├── schemas/                # The current schema for every table. Note: Schemas necessarily complete (certain tables have createdAt/updatedAt added at the Sequelize model level).
├── seedData.encrypted.ts   # The encrypted (and currently used) version of the seed data. Includes a test account.
├── seedData.ts             # The old unencrypted (and unused) version of the seed data. Kept around as a reference.
├── seeders/                # The seeders for generating all of the seed data.
└── tableNames.ts           # All of the table names in one convenient place.
```
