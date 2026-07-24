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

-- 10. TRIGGER AUTOMATIQUE CRÉATION COMPTE & PROFIL SUPABASE (INCLUS AUTOMATISATION ADMIN)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  IF NEW.email IN ('emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com', 'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com') THEN
    v_is_admin := TRUE;
    INSERT INTO public.admins (user_id, email, role)
    VALUES (NEW.id, NEW.email, 'super_admin')
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, phone, subscription_type, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    '695903205',
    COALESCE(NEW.raw_user_meta_data->>'subscription_type', 'vip'),
    v_is_admin
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    subscription_type = EXCLUDED.subscription_type,
    is_admin = EXCLUDED.is_admin;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan_id)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'subscription_type', 'vip'))
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ACTIVER LES REQUÊTES EN TEMPS RÉEL (REALTIME) SUR LES TABLES CLÉS SANS ERREUR SI DÉJÀ PRÉSENTES
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_sessions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.course_progress; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_conversations; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 11. TABLE ET SYSTÈMES ADMINISTRATEUR (ACCÈS INTÉGRAL SUPABASE)
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_email_key;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins select policy" ON public.admins;
CREATE POLICY "Admins select policy" ON public.admins FOR ALL USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- FONCTION HELPER POUR VÉRIFIER LE STATUT ADMINISTRATEUR SUR SUPABASE
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) OR EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email')
  ) OR (auth.jwt() ->> 'email') IN ('emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com', 'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. TABLE ORDERS / COMMANDES (PRÉPARATION AGRÉGATEUR DE PAIEMENT)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  pack_id TEXT DEFAULT 'griffon',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders policy" ON public.orders;
CREATE POLICY "Orders policy" ON public.orders FOR ALL USING (auth.uid() = user_id);

-- RLS OVERRIDES POUR DONNER L'ACCÈS INTÉGRAL À L'ADMINISTRATEUR SUR TOUTES LES TABLES UTILISATEUR
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access settings" ON public.user_settings;
CREATE POLICY "Admin full access settings" ON public.user_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access user_progress" ON public.user_progress;
CREATE POLICY "Admin full access user_progress" ON public.user_progress FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access exam_sessions" ON public.exam_sessions;
CREATE POLICY "Admin full access exam_sessions" ON public.exam_sessions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access course_progress" ON public.course_progress;
CREATE POLICY "Admin full access course_progress" ON public.course_progress FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access quiz_results" ON public.quiz_results;
CREATE POLICY "Admin full access quiz_results" ON public.quiz_results FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access subscriptions" ON public.subscriptions;
CREATE POLICY "Admin full access subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access ai_conversations" ON public.ai_conversations;
CREATE POLICY "Admin full access ai_conversations" ON public.ai_conversations FOR ALL USING (public.is_admin());

-- 13. PROMOTION AUTOMATIQUE DES COMPTES GMAIL ET ADMIN EXISTANTS
INSERT INTO public.admins (user_id, email, role)
SELECT id, email, 'super_admin' FROM auth.users 
WHERE email IN ('emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com', 'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com')
ON CONFLICT DO NOTHING;

UPDATE public.profiles 
SET is_admin = true, subscription_type = 'vip'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('emmuel.proreseau@gmail.com', 'joumefiomiguel@gmail.com', 'miguelemmuel@gmail.com', 'admin.miguel@griffondor.com', 'miguel.admin@griffondor.com', 'admin@griffondor.com', 'miguel@griffondor.com')
);

-- 14. SYSTÈMES ET TABLES FAPSHI (TRANSACTIONS, JOURNAUX DE PAIEMENTS, RLS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'Fapshi',
  provider_transaction_id TEXT,
  payment_method TEXT,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'FCFA',
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  webhook_status TEXT DEFAULT 'unprocessed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Transactions user select policy" ON public.transactions;
CREATE POLICY "Transactions user select policy" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Transactions user insert policy" ON public.transactions;
CREATE POLICY "Transactions user insert policy" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Transactions admin full access" ON public.transactions;
CREATE POLICY "Transactions admin full access" ON public.transactions FOR ALL USING (public.is_admin());

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON public.notifications(user_id, type);

CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_reference TEXT,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_tx_ref ON public.payment_logs(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON public.payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON public.payment_logs(event_type);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Payment logs user select policy" ON public.payment_logs;
CREATE POLICY "Payment logs user select policy" ON public.payment_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Payment logs admin full access" ON public.payment_logs;
CREATE POLICY "Payment logs admin full access" ON public.payment_logs FOR ALL USING (public.is_admin());

