# sticker-shop-group-project
group project for cs461

This is the (main) backend part of the project. The frontend can be found here:
https://github.com/gitnamehere/sticker-shop-group-project-frontend

## Setup Instructions:

There are two ways to run the backend, you can run this locally or with Docker.

### Locally

Setting up the database:

1. Install PostgreSQL (We used PostgreSQL 15) https://www.postgresql.org/download/

2. In sticker_shop_tables.sql, on line 2 insert `\c sticker_shop_db`

3. cd into ./sql

4. Run `psql postgres < sticker_shop_tables.sql`

4. In insert.sql, insert `\c sticker_shop_db`

5. Run `psql postgres < insert.sql`

Setting up the backend server:

1. Copy `.env.example` into `.env` and replace `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` with your local credentials

2. Run `npm install`

Starting the server:

Run `npm run start` to start the backend server

### Docker (Recommended if local installation doesn't work)

1. Install Docker Desktop https://www.docker.com/products/docker-desktop/

2. After installing Docker, run `docker-compose up --build`

Note: make sure there isn't anything else running that is using port 5432, otherwise the backend server might not be able
to connect to the database container
