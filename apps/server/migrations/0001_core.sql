CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  telegram_id varchar(32) NOT NULL UNIQUE,
  username varchar(64),
  first_name varchar(128) NOT NULL,
  last_name varchar(128),
  language_code varchar(16),
  plan varchar(16) NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS birth_profiles (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name varchar(48) NOT NULL,
  birth_date date NOT NULL,
  birth_time varchar(5),
  birth_place varchar(160),
  birth_time_zone varchar(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
