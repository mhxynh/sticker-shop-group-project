import express from "express";
import * as db from "../db.js";

export const ordersRouter = express.Router();

ordersRouter.get("/all", async (req, res) => {
  const result = await db.query("SELECT * FROM orders");
  res.json(result.rows);
});

ordersRouter.post("/", async (req, res) => {
  const client = await db.getClient();
  const { accountId, orderDate, status, items } = req.body;

  try {
    await client.query("BEGIN");

    // https://www.w3schools.com/sql/func_sqlserver_coalesce.asp
    const insertText = `
      INSERT INTO orders (account_id, order_date, status)
      VALUES ($1, COALESCE($2::timestamp, NOW()), $3)
      RETURNING *`;
    const values = [accountId, orderDate, status];
    const result = await client.query(insertText, values);
    const order = result.rows[0];

    if (items && Array.isArray(items) && items.length) {
      for (const item of items) {
        const { stickerId, stickerMaterialId, quantity} = item;
        if (!stickerId || !quantity) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "Each item requires stickerId and quantity" });
        }

        await client.query(
          `INSERT INTO order_items (order_id, sticker_id, sticker_material_id, quantity) VALUES ($1, $2, $3, $4)`,
          [order.order_id, stickerId, stickerMaterialId, quantity]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).location(`/orders/${order.order_id}`).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", err);
    res.sendStatus(500);
  } finally {
    client.release();
  }
});

ordersRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteText = "DELETE FROM orders WHERE order_id = $1";
    const result = await db.query(deleteText, [id]);
    if (result.rowCount === 0) {
      return res.sendStatus(404);
    }
    res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting order:", err);
    res.sendStatus(500);
  }
});

ordersRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.query("SELECT * FROM orders WHERE order_id = $1", [id]);
  if (result.rowCount === 0) return res.sendStatus(404);
  res.json(result.rows[0]);
});

export { ordersRouter };