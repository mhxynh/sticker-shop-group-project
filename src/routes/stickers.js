import express from "express";
import * as db from "../db.js";

const stickersRouter = express.Router();

const getStickerbyId = async (id) => {
  // check if it's an image sticker
  // TODO: add base64 encoding/decoding (when we eventually get around to doing that)
  // https://www.postgresql.org/docs/current/functions-binarystring.html
  const imageResult = await db.query("SELECT image_data FROM image_sticker WHERE sticker_id = $1", [id]);
  if (imageResult.rows.length) {
    return {
      type: "image",
      image_data: imageResult.rows[0].image_data
    }
  }

  // check if it's a polygonal sticker
  const polygonalResult = await db.query("SELECT shape FROM polygonal_sticker WHERE sticker_id = $1", [id]);
  if (polygonalResult.rows.length) {
    return {
      type: "polygonal",
      shape: polygonalResult.rows[0].shape
    }
  }

  // return nothing if no result (shouldn't happen)
  return {};
};

stickersRouter.get("/all", async (req, res) => {
  const result = await db.query("SELECT * FROM sticker");
  res.send(result.rows);
});

// basically "/all", but for the browse stickers page
stickersRouter.get("/browse", async (req, res) => {
  const result = await pool.query("SELECT sticker_id, name FROM sticker");

  for (let i = 0; i < result.rows.length; i++) {
    result.rows[i].sticker = await getStickerbyId(result.rows[i].sticker_id);
  }

  return res.send(result.rows);
})

stickersRouter.get("/creator/:creator_id", async (req, res) => {
  const { creator_id } = req.params;

  const result = await db.query("SELECT * FROM sticker WHERE creator_id = $1", [creator_id]);
  res.send(result.rows);
});

stickersRouter.get("/image_sticker", async (req, res) => {
  const result = await db.query("SELECT * FROM sticker, image_sticker WHERE sticker.sticker_id = image_sticker.sticker_id");
  res.send(result.rows);
});

stickersRouter.get("/polygonal", async (req, res) => {
  const result = await db.query("SELECT * FROM sticker, polygonal_sticker WHERE sticker.sticker_id = polygonal_sticker.sticker_id");
  res.send(result.rows);
});

stickersRouter.post("/create", async (req, res) => {
  const { creator_id, name, description, image_data } = req.body;
  const date_created = new Date();

  if (!creator_id || !name || !description || !image_data) {
    return res.status(400).send("All fields are required");
  }

  try {
    await getClient.query("BEGIN");
    // postgres supports returning data after inserting something
    // https://www.postgresql.org/docs/current/sql-insert.html
    const insertStickerText = "INSERT INTO sticker (creator_id, name, description, date_created) VALUES ($1, $2, $3, $4) RETURNING sticker_id";
    const stickerRes = await getClient.query(insertStickerText, [ creator_id, name, description, date_created ]);
    const sticker = stickerRes.rows[0];
    await getClient.query( "INSERT INTO image_sticker (sticker_id, image_data) VALUES ($1, $2)", [sticker.sticker_id, image_data]);
    await getClient.query("COMMIT");
    return res.sendStatus(200);
  } catch (error) {
    await getClient.query("ROLLBACK");
    console.log(error);
    res.status(500).send("Error creating sticker");
  } finally {
    getClient.release();
  }
});

stickersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db.query("SELECT * FROM sticker WHERE sticker_id = $1", [id]);
  if (!result.rows.length) return res.sendStatus(404);

  // get polygonal/image data
  const stickerData = await getStickerbyId(result.rows[0].sticker_id);

  if (!stickerData.type) return res.sendStatus(404);

  result.rows[0].sticker = stickerData;
  res.send(result.rows[0]);
});

export { stickersRouter };
