-- This application currently accesses PostgreSQL only from trusted server code.
-- Enable RLS on every application table so the Supabase Data API does not expose
-- user records to anon/authenticated clients by default. Server-side database
-- connections use a privileged role and must never be exposed to the WebApp.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birth_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarot_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_horoscopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horoscope_preferences ENABLE ROW LEVEL SECURITY;
