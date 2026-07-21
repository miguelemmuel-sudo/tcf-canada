-- MIGRATION SUPABASE COMPLÈTE AVEC RLS POUR TCF-CANADA PRO (GRIFFON D'OR)

-- 1. PROFILES (Inclus subscription_type & phone)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  country TEXT,
  phone TEXT DEFAULT '695903205',
  subscription_type TEXT DEFAULT 'griffon',
  language TEXT DEFAULT 'fr',
  timezone TEXT DEFAULT 'America/Toronto',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '695903205';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'griffon';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

CREATE POLICY "Profiles select policy" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert policy" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update policy" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. USER SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'fr',
  preferences JSONB DEFAULT '{}'::jsonb,
  notifications JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  account_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings select policy" ON public.user_settings;
DROP POLICY IF EXISTS "Settings insert/update policy" ON public.user_settings;

CREATE POLICY "Settings select policy" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Settings insert/update policy" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- 3. USER PROGRESS
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level TEXT DEFAULT 'B2',
  stats JSONB DEFAULT '{"examsCompleted": 0, "totalPracticeMinutes": 0, "streakDays": 0}'::jsonb,
  average_score NUMERIC DEFAULT 0,
  goals JSONB DEFAULT '{"targetNCLC": 7, "targetExamDate": null}'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Progress select/update policy" ON public.user_progress;
CREATE POLICY "Progress select/update policy" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- 4. EXAM SESSIONS (Examens en cours / complets / brouillons)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'listening', 'reading', 'writing', 'speaking', 'full'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  answers JSONB DEFAULT '{}'::jsonb,
  time_remaining_seconds INT DEFAULT 3600,
  score NUMERIC,
  current_step JSONB DEFAULT '{}'::jsonb,
  draft_text TEXT DEFAULT '',
  word_count INT DEFAULT 0,
  oral_recordings JSONB DEFAULT '[]'::jsonb,
  ai_feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exam sessions policy" ON public.exam_sessions;
CREATE POLICY "Exam sessions policy" ON public.exam_sessions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_status ON public.exam_sessions (user_id, status);

-- 5. COURSE PROGRESS
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  current_lesson TEXT,
  completion_percentage NUMERIC DEFAULT 0,
  last_page_visited INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course progress policy" ON public.course_progress;
CREATE POLICY "Course progress policy" ON public.course_progress FOR ALL USING (auth.uid() = user_id);

-- 6. QUIZ RESULTS
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  score NUMERIC NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quiz results policy" ON public.quiz_results;
CREATE POLICY "Quiz results policy" ON public.quiz_results FOR ALL USING (auth.uid() = user_id);

-- 7. AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  corrections JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  generated_exercises JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AI conversations policy" ON public.ai_conversations;
CREATE POLICY "AI conversations policy" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- 8. NOTIFICATIONS & RESERVATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications policy" ON public.notifications;
CREATE POLICY "Notifications policy" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 9. SUBSCRIPTIONS (Standard, Griffon, VIP)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  plan_id TEXT DEFAULT 'griffon',
  invoices JSONB DEFAULT '[]'::jsonb,
  renewal_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subscriptions policy" ON public.subscriptions;
CREATE POLICY "Subscriptions policy" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- 10. TRIGGER AUTOMATIQUE CRÉATION COMPTE & PROFIL SUPABASE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, phone, subscription_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    '695903205',
    COALESCE(NEW.raw_user_meta_data->>'subscription_type', 'griffon')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    subscription_type = EXCLUDED.subscription_type;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan_id)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'subscription_type', 'griffon'))
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ACTIVER LES REQUÊTES EN TEMPS RÉEL (REALTIME) SUR LES TABLES CLÉS
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_conversations;
