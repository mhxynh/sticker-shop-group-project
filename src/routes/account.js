import express from "express";
import * as db from "../db.js";

const accountRouter = express.Router();

accountRouter.post("/signup", async (req, res) => {
  const { firstName, middleName, lastName, email, phoneNumber, street, city, postalCode, password, isCreator } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !street || !city || !postalCode || !password) {
    return res.status(400).send("All required fields must be provided");
  }

  try {
    const result = await db.query(
      `INSERT INTO account (
        first_name, middle_name, last_name, email_address, password_hash,
        phone_number, street, city, postal_code, is_creator
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        firstName,
        middleName ?? null,
        lastName,
        email,
        password,
        phoneNumber,
        street,
        city,
        postalCode,
        isCreator ?? false,
      ]
    );

    const user = result.rows[0];
    if (user) delete user.password_hash;
    res.status(201).send(user);
  } catch (err) {
    res.sendStatus(500);
  }
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
  const user = result.rows[0];
  if (user) delete user.password_hash;
  res.send(user);
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
    password
  } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).send("At least one account field must be provided to update");
  }

  try {
    const exists = await db.query("SELECT account_id FROM account WHERE account_id = $1", [id]);
    if (exists.rowCount === 0) {
      return res.sendStatus(404);
    }

    // single UPDATE using COALESCE to preserve existing values when undefined
    // https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL
    const updateText = `
      UPDATE account SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email_address = COALESCE($3, email_address),
        phone_number = COALESCE($4, phone_number),
        street = COALESCE($5, street),
        city = COALESCE($6, city),
        postal_code = COALESCE($7, postal_code),
        password_hash = COALESCE($8, password_hash)
      WHERE account_id = $9
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
      password ?? null,
      id
    ];

    const result = await db.query(updateText, params);
    const updated = result.rows[0];
    if (updated) delete updated.password_hash;
    return res.send(updated);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error updating account");
  }
});

accountRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db.query("SELECT * FROM account WHERE account_id = $1", [id]);
  const user = result.rows[0];
  if (user) delete user.password_hash;
  res.send(user);
});

export { accountRouter };
