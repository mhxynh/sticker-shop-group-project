import express from "express";
import * as db from "../db.js";

const accountRouter = express.Router();

accountRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, email, phoneNumber, street, city, postalCode, paymentId, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !street || !city || !postalCode || !paymentId || !password) {
    return res.status(400).send("All fields are required");
  }

  const result = await db.query(
    "INSERT INTO account (first_name, last_name, email_address, phone_number, street, city, postal_code, payment_method, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [firstName, lastName, email, phoneNumber, street, city, postalCode, paymentId, password]
  );

  res.send(result.rows[0]);
});

accountRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const result = await db.query(
    "SELECT * FROM account WHERE email_address = $1 AND password_hash = $2",
    [email, password]
  );

  if (result.rowCount === 0) {
    return res.status(401).send("Invalid email or password");
  }
  res.send(result.rows[0]);
});

accountRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    street,
    city,
    postalCode,
    paymentId,
    password
  } = req.body;

  if (
    firstName === undefined &&
    lastName === undefined &&
    email === undefined &&
    phoneNumber === undefined &&
    street === undefined &&
    city === undefined &&
    postalCode === undefined &&
    paymentId === undefined &&
    password === undefined
  ) {
    return res.status(400).send("At least one account field must be provided to update");
  }

  try {
    const exists = await db.query("SELECT account_id FROM account WHERE account_id = $1", [id]);
    if (exists.rowCount === 0) {
      return res.sendStatus(404);
    }

    // single UPDATE using COALESCE to preserve existing values when undefined
    // https://www.w3schools.com/sql/func_sqlserver_coalesce.asp
    const updateText = `
      UPDATE account SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email_address = COALESCE($3, email_address),
        phone_number = COALESCE($4, phone_number),
        street = COALESCE($5, street),
        city = COALESCE($6, city),
        postal_code = COALESCE($7, postal_code),
        payment_method = COALESCE($8, payment_method),
        password_hash = COALESCE($9, password_hash)
      WHERE account_id = $10
      RETURNING *
    `;

    const params = [
      firstName ?? null,
      lastName ?? null,
      email ?? null,
      phoneNumber ?? null,
      street ?? null,
      city ?? null,
      postalCode ?? null,
      paymentId ?? null,
      password ?? null,
      id
    ];

    const result = await db.query(updateText, params);
    return res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error updating account");
  }
});

accountRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db.query("SELECT * FROM account WHERE account_id = $1", [id]);
  res.send(result.rows[0]);
});

export { accountRouter };