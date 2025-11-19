import express from "express";
import { pool } from "../db.js";

const stickersRouter = express.Router();

stickersRouter.get("/all", async (req, res) => {
  const result = await pool.query("SELECT * FROM sticker");
  res.send(result.rows);
});

stickersRouter.get("/creator/:creator_id", async (req, res) => {
  const { creator_id } = req.params;

  const result = await pool.query("SELECT * FROM sticker WHERE creator_id = $1", [creator_id]);
  res.send(result.rows);
});

stickersRouter.get("/image_sticker", async (req, res) => {
  const result = await pool.query("SELECT * FROM sticker, image_sticker WHERE sticker.sticker_id = image_sticker.sticker_id");
  res.send(result.rows);
});

stickersRouter.get("/polygonal", async (req, res) => {
  const result = await pool.query("SELECT * FROM sticker, polygonal_sticker WHERE sticker.sticker_id = polygonal_sticker.sticker_id");
  res.send(result.rows);
});

stickersRouter.post("/create", async (req, res) => {
  const client = await pool.connect();
 
  const { creator_id, name, description, image_data } = req.body;
  const date_created = new Date();

  if (!creator_id || !name || !description || !image_data) {
    return res.status(400).send("All fields are required");
  }

  try {
    await client.query("BEGIN");
    // postgres supports returning data after inserting something
    // https://www.postgresql.org/docs/current/sql-insert.html
    const insertStickerText = "INSERT INTO sticker (creator_id, name, description, date_created) VALUES ($1, $2, $3, $4) RETURNING sticker_id";
    const stickerRes = await client.query(insertStickerText, [ creator_id, name, description, date_created ]);
    const sticker = stickerRes.rows[0];
    await client.query( "INSERT INTO image_sticker (sticker_id, image_data) VALUES ($1, $2)", [sticker.sticker_id, image_data]);
    await client.query("COMMIT");
    return res.sendStatus(200);
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).send("Error creating sticker");
  } finally {
    client.release();
  }
});

stickersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query("SELECT * FROM sticker WHERE sticker_id = $1", [id]);
  res.send(result).rows[0];
});

export { stickersRouter };
