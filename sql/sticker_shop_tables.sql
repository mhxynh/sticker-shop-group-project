CREATE DATABASE sticker_shop_db;

CREATE TABLE account (
    account_id     SERIAL,
    first_name      VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100),
    last_name       VARCHAR(100) NOT NULL,
    email_address   VARCHAR(256) NOT NULL UNIQUE,
    password_hash   VARCHAR(256) NOT NULL,
    phone_number    VARCHAR(20) NOT NULL UNIQUE,
    street          VARCHAR(100),
    city            VARCHAR(50),
    postal_code	    VARCHAR(20),
    is_creator    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (account_id)
);

CREATE TABLE payment_method (
    payment_id	SERIAL,
    account_id	INTEGER,
    method		VARCHAR(64),
    PRIMARY KEY (payment_id),
    FOREIGN KEY (account_id) REFERENCES account (account_id)
);

CREATE TABLE sticker (
    sticker_id      SERIAL,
    account_id      INTEGER,
    name            VARCHAR(64) NOT NULL,
    description	    VARCHAR(256),
    date_created    DATE NOT NULL,
    PRIMARY KEY (sticker_id),
    FOREIGN KEY (account_id) REFERENCES account (account_id)
);

CREATE TABLE sticker_sizes (
    size_id     SERIAL,
    length      DECIMAL (5, 2) NOT NULL, -- stored in centimeters
    width       DECIMAL (5, 2) NOT NULL,
    sticker_id  INTEGER,
    PRIMARY KEY (size_id),
    FOREIGN KEY (sticker_id) REFERENCES sticker (sticker_id),
    CHECK (length <= 100), -- max 100 centimeters or 1 meter
    CHECK (width <= 100)
);

CREATE TABLE image_sticker (
    sticker_id  INTEGER,
    image_data  bytea NOT NULL, -- Postgres also doesn't have BLOB so we will use bytea
                                -- https://www.postgresql.org/docs/current/datatype-binary.html
    PRIMARY KEY (sticker_id),
    FOREIGN KEY (sticker_id) REFERENCES sticker (sticker_id)
);

CREATE TABLE polygonal_sticker (
    sticker_id  INTEGER,
    shape       VARCHAR(32) NOT NULL,
    PRIMARY KEY (sticker_id),
    FOREIGN KEY (sticker_id) REFERENCES sticker (sticker_id)
);

CREATE TABLE materials (
    material_id     SERIAL,
    material        VARCHAR(64) NOT NULL UNIQUE,
    price           DECIMAL(4, 2) NOT NULL,
    PRIMARY KEY (material_id)
);

-- maybe change this to an enum instead since we are approaching this differently now
CREATE TABLE colors (
    color_id    SERIAL,
    color       VARCHAR(30) NOT NULL UNIQUE,
    PRIMARY KEY (color_id)
);

CREATE TABLE sticker_material (
    sticker_material_id SERIAL,
    sticker_id          INTEGER,
    material_id         INTEGER,
    color_id            INTEGER,
    PRIMARY KEY (sticker_material_id),
    FOREIGN KEY (sticker_id) REFERENCES sticker (sticker_id),
    FOREIGN KEY (material_id) REFERENCES materials (material_id),
    FOREIGN KEY (color_id) REFERENCES colors (color_id)
);

CREATE TABLE orders (
    order_id	SERIAL,
    account_id INTEGER,
    PRIMARY KEY (order_id),
    FOREIGN KEY (account_id) REFERENCES account (account_id)
);

CREATE TABLE order_items (
    id                  SERIAL,
    order_id            INTEGER,
    sticker_id          INTEGER,
    sticker_material_id INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders (order_id),
    FOREIGN KEY (sticker_id) REFERENCES sticker (sticker_id),
    FOREIGN KEY (sticker_material_id) REFERENCES sticker_material (sticker_material_id)
);
