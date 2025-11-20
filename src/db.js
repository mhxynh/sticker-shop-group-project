import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
}
);

export const query = async (text, params) => {
  return pool.query(text, params);
}

export const getClient = async () => {
  const client = await pool.connect();
  const initialRelease = client.release.bind(client);
  let released = false;
  client.release = () => {
    if (!released) {
      released = true;
      return initialRelease();
    }
    return Promise.resolve();
  }
  return client;
}

export { pool };
