CREATE TABLE IF NOT EXISTS tarot_readings (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spread_id varchar(32) NOT NULL,
  title varchar(120) NOT NULL,
  summary text NOT NULL,
  cards jsonb NOT NULL,
  daily_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tarot_readings_spread_check
    CHECK (spread_id IN ('daily', 'past-present-future', 'love')),
  CONSTRAINT tarot_readings_daily_unique
    UNIQUE (user_id, daily_date)
);

CREATE INDEX IF NOT EXISTS tarot_readings_user_created_idx
  ON tarot_readings (user_id, created_at DESC);
