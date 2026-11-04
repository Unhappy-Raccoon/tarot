ALTER TABLE public.horoscope_preferences
  ADD COLUMN IF NOT EXISTS notification_claim_date date,
  ADD COLUMN IF NOT EXISTS notification_claimed_at timestamptz;

CREATE INDEX IF NOT EXISTS horoscope_preferences_due_idx
  ON public.horoscope_preferences (notifications_enabled, notification_time)
  WHERE notifications_enabled = true;
