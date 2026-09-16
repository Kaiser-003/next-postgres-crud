import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();

  const result = await client.query("SELECT * FROM users");

  console.table(result.rows);
} catch (error) {
  console.error("Database error:", error.message);
} finally {
  await client.end();
}