-- this file contains all the queries used in the backend application
-- we use node-postgres so the values are inserted via a function call
-- (it definitely won't work if you run this as is)

-- account.js
INSERT INTO account (
first_name, middle_name, last_name, email_address, password_hash,
phone_number, street, city, postal_code, is_creator
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;

SELECT * FROM account WHERE email_address = $1 AND password_hash = $2;

SELECT account_id FROM account WHERE account_id = $1;

-- comment below is from the application where this query is used
-- single UPDATE using COALESCE to preserve existing values when undefined
-- https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL
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

SELECT * FROM account WHERE account_id = $1;

-- order.js
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
WHERE oi.order_id = $1;

INSERT INTO orders (account_id)
    VALUES ($1)
RETURNING *;

SELECT sticker_material_id FROM sticker_material WHERE sticker_id = $1 AND material_id = $2 AND color_id = $3;

INSERT INTO sticker_material (sticker_id, material_id, color_id) VALUES ($1, $2, $3) RETURNING sticker_material_id;

INSERT INTO order_items (order_id, sticker_id, sticker_material_id, sticker_size_id) VALUES ($1, $2, $3, $4);

DELETE FROM order_items WHERE order_id = $1;

DELETE FROM orders WHERE order_id = $1;

SELECT * FROM orders WHERE order_id = $1 AND account_id = $2;

-- stickers.js
SELECT * FROM materials;

SELECT * FROM colors;

SELECT * FROM sticker_sizes WHERE sticker_id = $1;

-- comment below is from the application where this query is used
-- check if it's an image sticker
-- use the postgres encode function to encode the image in base64
-- https://www.postgresql.org/docs/current/functions-binarystring.html
SELECT encode(image_data, 'base64') FROM image_sticker WHERE sticker_id = $1;

SELECT shape FROM polygonal_sticker WHERE sticker_id = $1;

SELECT * FROM sticker;

SELECT sticker_id, name FROM sticker WHERE is_deleted = FALSE;

SELECT * FROM sticker WHERE account_id = $1;

SELECT * FROM sticker, image_sticker WHERE sticker.sticker_id = image_sticker.sticker_id;

SELECT * FROM sticker, polygonal_sticker WHERE sticker.sticker_id = polygonal_sticker.sticker_id;

INSERT INTO sticker (account_id, name, description, date_created) VALUES ($1, $2, $3, $4) RETURNING sticker_id;

INSERT INTO sticker_sizes (length, width, sticker_id) VALUES ($1, $2, $3);

INSERT INTO image_sticker (sticker_id, image_data) VALUES ($1, $2);

SELECT sticker_id FROM sticker WHERE sticker_id = $1;

-- This one's a weird one since the query is dynamically created depending on what will be updated
-- see line 144 in stickers.js
-- UPDATE sticker SET ${stickerUpdates.join(", ")} WHERE sticker_id = $${paramIndex}

SELECT sticker_id FROM sticker WHERE sticker_id = $1;

UPDATE sticker SET is_deleted = TRUE WHERE sticker_id = $1;

SELECT first_name FROM account WHERE account_id = $1;
