CREATE TABLE IF NOT EXISTS ai_conversations (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title varchar(72) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_conversations_user_updated_idx
  ON ai_conversations (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_messages (
  id serial PRIMARY KEY,
  conversation_id integer NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role varchar(16) NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  provider varchar(40),
  model varchar(100),
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_messages_conversation_created_idx
  ON ai_messages (conversation_id, created_at, id);

CREATE TABLE IF NOT EXISTS ai_daily_usage (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  messages_used integer NOT NULL DEFAULT 0 CHECK (messages_used >= 0),
  input_tokens integer NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens integer NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_daily_usage_user_date_unique UNIQUE (user_id, usage_date)
);
