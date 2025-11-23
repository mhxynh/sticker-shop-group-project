// standard express starter code https://expressjs.com/en/starter/hello-world.html
import express from "express";
import cors from "cors";
const app = express();
const port = 3000;
import { stickersRouter } from "./routes/stickers.js";

app.use(cors());
app.use("/stickers", stickersRouter);

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
