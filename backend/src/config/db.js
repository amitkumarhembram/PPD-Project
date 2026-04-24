const { Pool } = require('pg');
require('dotenv').config();

// DATABASE_URL is used when deploying to Neon (Render sets this automatically
// if you link a Neon database, or you can paste the connection string manually).
// Individual DB_* vars are kept as a fallback for local development.
const pool = process.env.DATABASE_URL
    ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          // Supabase pooler (port 6543) requires prepared statements disabled
          max: 10,
      })
    : new Pool({
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT,
      });

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
};
