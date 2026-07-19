-- MIGRATION SUPABASE COMPLÈTE AVEC RLS POUR TCF-CANADA PRO

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  country TEXT,
  phone TEXT,
  language TEXT DEFAULT 'fr',
  timezone TEXT DEFAULT 'America/Toronto',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles select policy" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

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

CREATE POLICY "Settings select policy" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Settings insert/update policy" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

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

CREATE POLICY "Progress select/update policy" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- 4. EXAM SESSIONS (Examens en cours / complets / brouillons)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'listening', 'reading', 'writing', 'speaking', 'full'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  answers JSONB DEFAULT '{}'::jsonb,
  time_remaining_seconds INT DEFAULT 3600,
  score NUMERIC,
  current_step JSONB DEFAULT '{}'::jsonb, -- audio en cours, page, position
  draft_text TEXT DEFAULT '', -- pour l'expression écrite
  word_count INT DEFAULT 0,
  oral_recordings JSONB DEFAULT '[]'::jsonb,
  ai_feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exam sessions policy" ON public.exam_sessions
  FOR ALL USING (auth.uid() = user_id);

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

CREATE POLICY "Course progress policy" ON public.course_progress
  FOR ALL USING (auth.uid() = user_id);

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

CREATE POLICY "Quiz results policy" ON public.quiz_results
  FOR ALL USING (auth.uid() = user_id);

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

CREATE POLICY "AI conversations policy" ON public.ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- 8. NOTIFICATIONS
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

CREATE POLICY "Notifications policy" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 9. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  plan_id TEXT DEFAULT 'free',
  invoices JSONB DEFAULT '[]'::jsonb,
  renewal_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions policy" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ACTIVER LES REQUÊTES EN TEMPS RÉEL (REALTIME) SUR LES TABLES CLÉS
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_conversations;
