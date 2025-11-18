import express from "express";
import { pool } from "../db.js";

const stickersRouter = express.Router();

stickersRouter.get("/all", async (req, res) => {
  const result = await pool.query("SELECT * FROM sticker");
  res.send(result.rows);
});

stickersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await pool.query("SELECT * FROM sticker WHERE sticker_id = $1", [id]);
  res.send(result).rows[0];
});

export { stickersRouter };
