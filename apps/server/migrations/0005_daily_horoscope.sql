CREATE TABLE IF NOT EXISTS daily_horoscopes (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_date date NOT NULL,
  time_zone varchar(64) NOT NULL,
  title varchar(120) NOT NULL,
  content text NOT NULL,
  transit_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_horoscopes_user_date_zone_unique UNIQUE (user_id, local_date, time_zone)
);

CREATE INDEX IF NOT EXISTS daily_horoscopes_user_created_idx
  ON daily_horoscopes (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS horoscope_preferences (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  time_zone varchar(64) NOT NULL DEFAULT 'Europe/Tallinn',
  notifications_enabled boolean NOT NULL DEFAULT false,
  notification_time varchar(5) NOT NULL DEFAULT '09:00'
    CHECK (notification_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  last_sent_local_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
