const { Pool } = require("pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use Railway-provided variable
  ssl: {
    rejectUnauthorized: false, // Needed for secure connection
  },
});

module.exports = pool;

const pool = new Pool({
    host: "centerbeam.proxy.rlwy.net",
    port: 26655,
    user: "postgres",
    password: "lhsuKSVTHcDEpvPkTDUhXZgExLXEFJth",
    database: "railway",
    ssl: { rejectUnauthorized: false }, // Required for Railway
});

// Test connection
pool.connect()
    .then(client => {
        console.log("✅ Connected to PostgreSQL");
        client.release(); // Release client back to pool
    })
    .catch(err => console.error("❌ Connection error:", err.stack));

module.exports = pool;
