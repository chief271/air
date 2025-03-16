const { Pool } = require("pg");


const pool = new Pool({
  connectionString: "postgresql://postgres:lhsuKSVTHcDEpvPkTDUhXZgExLXEFJth@centerbeam.proxy.rlwy.net:26655/railway",
  ssl: { rejectUnauthorized: false, require: true },
});


pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL on Railway"))
  .catch((err) => console.error("❌ Connection error", err));




module.exports = pool;
