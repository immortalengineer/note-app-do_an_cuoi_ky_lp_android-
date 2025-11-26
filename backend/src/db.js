// db.js
import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER || "noteuser",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "notedb",
  password: process.env.DB_PASSWORD || "note123",
  port: process.env.DB_PORT || 5432,
});

// Test kết nối
pool.connect((err) => {
  if (err) {
    console.error("❌ Không thể kết nối PostgreSQL:", err);
  } else {
    console.log("✅ Đã kết nối PostgreSQL");
  }
});
