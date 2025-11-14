import { Pool } from "pg";

// TODO: use an .env file instead of hardcoding the config
const pool = new Pool({
  user: "postgres",
  password: "password",
  host: "localhost",
  port: 5432,
  database: "sticker_shop_db"
});

export { pool };
