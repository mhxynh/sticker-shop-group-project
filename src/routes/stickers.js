import express from "express";
import { pool } from "../db.js";

const stickersRouter = express.Router();

stickersRouter.get("/all", (req, res) => {
  pool.query("SELECT * FROM sticker").then((result) => {
    res.send(result.rows);
  }).catch((error) => {
    console.log(error);
  });
});

stickersRouter.get("/:id", (req, res) => {
  const { id } = req.params;

  pool.query("SELECT * FROM sticker WHERE sticker_id = $1", [id]).then((result) => {
    if (result.rows) res.send(result.rows[0]);
  }).catch((error) => {
    console.log(error);
  })
});

export { stickersRouter };
