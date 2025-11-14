const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV;
const envPath = path.resolve(__dirname, "..", `.env.${env}`);

dotenv.config({ path: envPath });

const config = {
development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    dialectOptions: {
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    },
},
production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    dialectOptions: {
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    },
},
};

module.exports = config[env];