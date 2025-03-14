const { Pool } = require("pg");

const pool = new Pool({
    host: "centerbeam.proxy.rlwy.net",
    port: 26655,
    user: "postgres",
    password: "lhsuKSVTHcDEpvPkTDUhXZgExLXEFJth",
    database: "railway",
    ssl: { rejectUnauthorized: false }, // Use SSL if required by Railway
});

client.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error("Connection error", err.stack));

module.exports = pool;
