import express from "express";
import multer from "multer";
import * as db from "../db.js";

const upload = multer();

const stickersRouter = express.Router();

export const getStickerbyId = async (id) => {
  const materials = await db.query("SELECT * FROM materials");
  const colors = await db.query("SELECT * FROM colors");
  const sizes = await db.query("SELECT * FROM sticker_sizes WHERE sticker_id = $1", [id]);

  // check if it's an image sticker
  // use the postgres encode function to encode the image in base64
  // https://www.postgresql.org/docs/current/functions-binarystring.html
  const imageResult = await db.query("SELECT encode(image_data, 'base64') FROM image_sticker WHERE sticker_id = $1", [id]);
  if (imageResult.rows.length) {
    return {
      type: "image",
      image_data: imageResult.rows[0].encode,
      materials: materials.rows,
      colors: colors.rows,
      sizes: sizes.rows
    }
  }

  // check if it's a polygonal sticker
  const polygonalResult = await db.query("SELECT shape FROM polygonal_sticker WHERE sticker_id = $1", [id]);
  if (polygonalResult.rows.length) {
    return {
      type: "polygonal",
      shape: polygonalResult.rows[0].shape,
      materials: materials.rows,
      colors: colors.rows,
      sizes: sizes.rows
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
  const result = await db.query("SELECT sticker_id, name FROM sticker WHERE is_deleted = FALSE");

  for (let i = 0; i < result.rows.length; i++) {
    result.rows[i].sticker = await getStickerbyId(result.rows[i].sticker_id);
  }

  return res.send(result.rows);
})

stickersRouter.get("/creator/:account_id", async (req, res) => {
  const { account_id } = req.params;

  const result = await db.query("SELECT * FROM sticker WHERE account_id = $1", [account_id]);
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

// multer stuff https://github.com/expressjs/multer
stickersRouter.post("/create", upload.single("imageData"), async (req, res) => {
  const client = await db.getClient();

  const { account_id, name, description } = req.body;
  const date_created = new Date();

  if (!account_id || !name || !description || !req.file) {
    return res.status(400).send("All fields are required");
  }

  const image_data = req.file.buffer;

  try {
    await client.query("BEGIN");
    // postgres supports returning data after inserting something
    // https://www.postgresql.org/docs/current/sql-insert.html
    const insertStickerText = "INSERT INTO sticker (account_id, name, description, date_created) VALUES ($1, $2, $3, $4) RETURNING sticker_id";
    const stickerRes = await client.query(insertStickerText, [ account_id, name, description, date_created ]);
    const sticker = stickerRes.rows[0];
    // default insert a 10 cm x 10 cm sticker until we have a sticker size field in frontend
    await client.query("INSERT INTO sticker_sizes (length, width, sticker_id) VALUES ($1, $2, $3)", [10, 10, sticker.sticker_id]);
    await client.query("INSERT INTO image_sticker (sticker_id, image_data) VALUES ($1, $2)", [sticker.sticker_id, image_data]);
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

stickersRouter.put("/:id", async (req, res) => {
  const client = await db.getClient();
  const { id } = req.params;
  const { name, description } = req.body;


  if (!name && !description) {
    return res.status(400).send("At least a name or description is required");
  }

  try {
    await client.query("BEGIN");
    const stickerExists = await client.query("SELECT sticker_id FROM sticker WHERE sticker_id = $1", [id]);
    if (stickerExists.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.sendStatus(404);
    }
    let paramIndex = 1;
    let stickerUpdates = [];
    const updatesParams = [];
    
    if (name) {
      stickerUpdates.push(`name = $${paramIndex}`);
      updatesParams.push(name);
      paramIndex++;
    }
    if (description) {
      stickerUpdates.push(`description = $${paramIndex}`);
      updatesParams.push(description);
      paramIndex++;
    }
    if (stickerUpdates.length) {
      updatesParams.push(id);
      const updateText = `UPDATE sticker SET ${stickerUpdates.join(", ")} WHERE sticker_id = $${paramIndex}`;
      await client.query(updateText, updatesParams);
    }

    await client.query("COMMIT");
    return res.sendStatus(200);
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).send("Error updating sticker");
  } finally {
    client.release();
  }
});

stickersRouter.delete("/:id", async (req, res) => {
  const client = await db.getClient();
  const { id } = req.params;

  if (!id) {
    return res.status(400).send("Sticker ID is required");
  }

  try {
    await client.query("BEGIN");
    const stickerExists = await client.query("SELECT sticker_id FROM sticker WHERE sticker_id = $1", [id]);
    await client.query("UPDATE sticker SET is_deleted = TRUE WHERE sticker_id = $1", [id]);
    await client.query("COMMIT");
    return res.sendStatus(200);
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).send("Error deleting sticker");
  } finally {
    client.release();
  }
});

stickersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db.query("SELECT * FROM sticker WHERE sticker_id = $1", [id]);
  if (!result.rows.length) return res.sendStatus(404);

  const creator = await db.query("SELECT first_name FROM account WHERE account_id = $1", [result.rows[0].account_id]);
  if (!creator.rows.length) return res.sendStatus(500);

  result.rows[0].creator = creator.rows[0].first_name;

  // get polygonal/image data
  const stickerData = await getStickerbyId(result.rows[0].sticker_id);

  if (!stickerData.type) return res.sendStatus(404);

  result.rows[0].sticker = stickerData;
  res.send(result.rows[0]);
});

export { stickersRouter };
