INSERT INTO creator (first_name, last_name, email_address, phone_number)
VALUES ('Sticker', 'Shop', 'thestickershop@stickershop.com', '123-456-7890');

INSERT INTO sticker (creator_id, name, description, date_created)
VALUES (1, 'Square Sticker', 'A sticker that is a shape of a square.', current_date); -- use current_date https://www.postgresql.org/docs/8.2/functions-datetime.html
INSERT INTO polygonal_sticker
VALUES (1, 'square');

INSERT INTO sticker (creator_id, name, description, date_created)
VALUES (1, 'Circle Sticker', 'A sticker that is a shape of a circle.', current_date);
INSERT INTO polygonal_sticker
VALUES (2, 'circle');

INSERT INTO sticker (creator_id, name, description, date_created)
VALUES (1, 'Triangle Sticker', 'A sticker that is a shape of a triangle.', current_date);
INSERT INTO polygonal_sticker
VALUES (3, 'triangle');

-- materials based on what RedBubble has
-- https://www.redbubble.com/i/sticker/Hang-on-Let-me-overthink-this-by-chestify/29205665.EJUG5
INSERT INTO materials (material, price)
VALUES ('vinyl-glossy', 1.00);
INSERT INTO materials (material, price)
VALUES ('vinyl-matte', 0.75);
INSERT INTO materials (material, price)
VALUES ('vinyl-holographic', 1.25);

INSERT INTO colors (color)
VALUES ('red');
INSERT INTO colors (color)
VALUES ('orange');
INSERT INTO colors (color)
VALUES ('yellow');
INSERT INTO colors (color)
VALUES ('green');
INSERT INTO colors (color)
VALUES ('blue');
INSERT INTO colors (color)
VALUES ('purple');
INSERT INTO colors (color)
VALUES ('black');
INSERT INTO colors (color)
VALUES ('white');

-- square
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (1, 1, 1);
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (1, 2, 1);
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (1, 1, 8);

-- circle
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (2, 1, 1);
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (2, 2, 1);
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (2, 1, 8);

-- triangle
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (3, 1, 1);
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (3, 2, 1);
INSERT INTO sticker_material (sticker_id, material_id, color_id)
VALUES (3, 1, 8);
