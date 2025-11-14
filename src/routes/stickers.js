import express from "express";
import { pool } from "../db.js";

const stickersRouter = express.Router();

stickersRouter.get("/all", (req, res) => {
  const query = pool.query("SELECT * FROM sticker");

  console.log(query);

  res.send(query);
})

export { stickersRouter };
