--
-- Importing the "similar channels" is much trickier than expected :-/
--
-- DuckDB does not yet support deferring constraints (which is how this would be done in, for example, Postgres), and
-- also it has some funky issues with indices (see https://duckdb.org/docs/stable/sql/indexes.html) which even makes
-- an "insert-then-update" approach unviable. And, of course, we can't add the constraints *after* the import either
-- because "ALTER TABLE...DD CONSTRAINT" isn't implemented :-/
--
-- Thus, the cleanest approach seems to be this: insert into a table without FKs and when done, copy everything to
-- a properly configured table. (Of course there is no SELECT...INTO).
--
COPY similar_channels TO $file (FORMAT JSON);

DROP TABLE similar_channels;

CREATE TABLE similar_channels (
  channel_id UINTEGER REFERENCES channels (id) NOT NULL,
  similar_channel_id UINTEGER REFERENCES channels (id) CHECK (channel_id <> similar_channel_id) NOT NULL,
  PRIMARY KEY (channel_id, similar_channel_id)
);

COPY similar_channels
FROM
  $file (FORMAT JSON);
