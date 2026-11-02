ALTER TABLE birth_profiles
  ADD COLUMN IF NOT EXISTS birth_latitude double precision,
  ADD COLUMN IF NOT EXISTS birth_longitude double precision;

ALTER TABLE birth_profiles
  DROP CONSTRAINT IF EXISTS birth_profiles_coordinates_pair_check;

ALTER TABLE birth_profiles
  ADD CONSTRAINT birth_profiles_coordinates_pair_check
  CHECK (
    (birth_latitude IS NULL AND birth_longitude IS NULL)
    OR
    (birth_latitude BETWEEN -90 AND 90 AND birth_longitude BETWEEN -180 AND 180)
  );

CREATE TABLE IF NOT EXISTS natal_charts (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  input_hash varchar(64) NOT NULL,
  algorithm_version varchar(32) NOT NULL,
  chart_data jsonb NOT NULL,
  calculated_at timestamptz NOT NULL
);
