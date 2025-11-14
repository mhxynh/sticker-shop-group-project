import express from "express";
import { pool } from "../db.js";

const stickersRouter = express.Router();

stickersRouter.get("/all", (req, res) => {
  pool.query("SELECT * FROM sticker").then((result) => {
    res.send(result);
  })
})

export { stickersRouter };
