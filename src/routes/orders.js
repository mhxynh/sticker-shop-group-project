import express from "express";
import * as db from "../db.js";
import { getStickerbyId } from "./stickers.js";

const ordersRouter = express.Router();

ordersRouter.get("/:accountId/all", async (req, res) => {
  const { accountId } = req.params;

  try {
    const result = await db.query("SELECT * FROM orders WHERE account_id = $1", [accountId]);
    if(result.rowCount === 0) {
      return res.sendStatus(404);
    }
    for (const order of result.rows) {
      const itemsQuery = `
        SELECT
          oi.id,
          oi.order_id,
          oi.sticker_id,
          oi.sticker_material_id,
          oi.sticker_size_id,
          m.material AS material,
          c.color AS color,
          ss.length,
          ss.width
        FROM order_items oi
        LEFT JOIN sticker_material sm ON oi.sticker_material_id = sm.sticker_material_id
        LEFT JOIN materials m ON sm.material_id = m.material_id
        LEFT JOIN colors c ON sm.color_id = c.color_id
        LEFT JOIN sticker_sizes ss ON oi.sticker_size_id = ss.size_id
        WHERE oi.order_id = $1
      `;
      const itemsResult = await db.query(itemsQuery, [order.order_id]);
      for (const item of itemsResult.rows) {
        try {
          const stickerData = await getStickerbyId(item.sticker_id);
          item.sticker = stickerData;
        } catch (err) {
          console.error("Error fetching sticker data for sticker_id", item.sticker_id, err);
          item.sticker = {};
        }
      }
      order.items = itemsResult.rows;
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.sendStatus(500);
  }
});

ordersRouter.post("/", async (req, res) => {
  const client = await db.getClient();
  const { accountId, items } = req.body;

  try {
    await client.query("BEGIN");

    const insertText = `
      INSERT INTO orders (account_id)
      VALUES ($1)
      RETURNING *`;
    const values = [accountId];
    const result = await client.query(insertText, values);
    const order = result.rows[0];

    if (items && Array.isArray(items) && items.length) {
      for (const item of items) {
        const { stickerId, materialId, colorId, sizeId, quantity } = item;

        if (!stickerId || !materialId || !colorId || !quantity || !sizeId) {
          await client.query("ROLLBACK");
          return res.status(400).json({ error: "Each item requires stickerId, materialId, colorId, sizeId, and quantity" });
        }

        const smSelect = `SELECT sticker_material_id FROM sticker_material WHERE sticker_id = $1 AND material_id = $2 AND color_id = $3`;
        const smResult = await client.query(smSelect, [stickerId, materialId, colorId]);
        let stickerMaterialId;
        if (smResult.rows.length) {
          stickerMaterialId = smResult.rows[0].sticker_material_id;
        } else {
          const smInsert = `INSERT INTO sticker_material (sticker_id, material_id, color_id) VALUES ($1, $2, $3) RETURNING sticker_material_id`;
          const smInsertRes = await client.query(smInsert, [stickerId, materialId, colorId]);
          stickerMaterialId = smInsertRes.rows[0].sticker_material_id;
        }

        await client.query(
          `INSERT INTO order_items (order_id, sticker_id, sticker_material_id, sticker_size_id) VALUES ($1, $2, $3, $4)`,
          [order.order_id, stickerId, stickerMaterialId, sizeId]
        );
      }
    }

    await client.query("COMMIT");
    res.json(order);
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

ordersRouter.get("/:accountId/:orderId", async (req, res) => {
  const { orderId, accountId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM orders WHERE order_id = $1 AND account_id = $2",
      [orderId, accountId]
    );
    if (result.rowCount === 0) {
      return res.sendStatus(404);
    }
    const { order_id, account_id } = result.rows[0];
    const itemsQuery = `
      SELECT
        oi.id,
        oi.order_id,
        oi.sticker_id,
        oi.sticker_material_id,
        oi.sticker_size_id,
        m.material AS material,
        c.color AS color,
        ss.length,
        ss.width
      FROM order_items oi
      LEFT JOIN sticker_material sm ON oi.sticker_material_id = sm.sticker_material_id
      LEFT JOIN materials m ON sm.material_id = m.material_id
      LEFT JOIN colors c ON sm.color_id = c.color_id
      LEFT JOIN sticker_sizes ss ON oi.sticker_size_id = ss.size_id
      WHERE oi.order_id = $1
    `;
    const orderItems = await db.query(itemsQuery, [order_id]);
    for (const item of orderItems.rows) {
      try {
        const stickerData = await getStickerbyId(item.sticker_id);
        item.sticker = stickerData;
      } catch (err) {
        console.error("Error fetching sticker data for sticker_id", item.sticker_id, err);
        item.sticker = {};
      }
    }
    res.json({ order_id, account_id, items: orderItems.rows });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.sendStatus(500);
  }
});

export { ordersRouter };
