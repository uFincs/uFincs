// Need to cast it to a string literal otherwise Sequelize's types complain
// that it's 'just' a string, when it expects certain string literals.
const dialect: "postgres" = "postgres";

const allConfigs = {
    development: {
        username: "app-database-user",
        password: "app-database-password",
        database: "app-database",
        host: "backend-database",
        dialect,
        define: {
            freezeTableName: true
        }
    },
    production: {
        username: "app-database-user",
        password: process.env.POSTGRES_PASSWORD,
        database: "app-database",
        host: "backend-database",
        dialect,
        define: {
            freezeTableName: true
        }
    }
};

// Need a CommonJS default export so that Sequelize can pick up the object correctly when running migrations.
// Since `export default allConfigs` gets compiled to a named export of 'default' (i.e. `exports.default = allConfigs`),
// that isn't good enough for Sequelize to pick up the configs. As such, we need both export syntaxes.
module.exports = allConfigs;

export default allConfigs;
