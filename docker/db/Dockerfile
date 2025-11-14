# populate db with sample data
# https://docs.docker.com/guides/pre-seeding/#pre-seed-the-database-by-bind-mounting-a-sql-script
FROM postgres:15

COPY ./sql/sticker_shop_tables.sql /docker-entrypoint-initdb.d/

COPY ./sql/insert.sql /docker-entrypoint-initdb.d/
