-- ====================================================================
-- MIGRATION SQL FAPSHI - TCF-CANADA PRO (GRIFFON D'OR)
-- A exécuter dans l'éditeur SQL Supabase (Production & Développement)
-- ====================================================================

-- 1. ADAPTER ET COMPLÉTER LA TABLE SUBSCRIPTIONS
-- Nous vérifions et ajoutons les colonnes requises pour la gestion des durées et packs Fapshi
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack TEXT NOT NULL DEFAULT 'griffon',
  amount TEXT DEFAULT '25000',
  currency TEXT DEFAULT 'FCFA',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la table existait déjà avec une ancienne structure (ex: user_id en clé primaire)
DO $$
BEGIN
  -- Ajout des colonnes si elles manquent
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS pack TEXT DEFAULT 'griffon'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS amount TEXT DEFAULT '25000'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  
  -- S'assurer que user_id n'est plus la contrainte PK unique bloquante si on veut autoriser l'historique d'abonnements
  BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey CASCADE;
    ALTER TABLE public.subscriptions ADD PRIMARY KEY (id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires_at ON public.subscriptions(status, expires_at);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subscriptions user select policy" ON public.subscriptions;
CREATE POLICY "Subscriptions user select policy" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Subscriptions admin full access" ON public.subscriptions;
CREATE POLICY "Subscriptions admin full access" ON public.subscriptions FOR ALL USING (public.is_admin());


-- 2. CRÉATION DE LA TABLE TRANSACTIONS (SUIVI DES PAIEMENTS FAPSHI)
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
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'expired'
  webhook_status TEXT DEFAULT 'unprocessed', -- 'unprocessed', 'processed', 'error'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_tx_id ON public.transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Transactions user select policy" ON public.transactions;
CREATE POLICY "Transactions user select policy" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions user insert policy" ON public.transactions;
CREATE POLICY "Transactions user insert policy" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions admin full access" ON public.transactions;
CREATE POLICY "Transactions admin full access" ON public.transactions FOR ALL USING (public.is_admin());


-- 3. MISE À JOUR DE LA TABLE NOTIFICATIONS
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON public.notifications(user_id, type);


-- 4. CRÉATION DE LA TABLE PAYMENT_LOGS (AUDIT ET TRAÇABILITÉ API/WEBHOOKS)
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_reference TEXT,
  event_type TEXT NOT NULL, -- 'initiate', 'webhook_received', 'webhook_processed', 'webhook_error', 'status_check', 'error'
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


-- 5. ACTIVER LE REALTIME SUR LES NOUVELLES TABLES POUR UNE EXPÉRIENCE UTILISATEUR INSTANTANÉE
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 6. DONNER LES DROITS ADMINISTRATEUR INTÉGRAUX À ADMINISTRATEUR RÉSEAU MIGUEL SUR LES NOUVELLES TABLES
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

SELECT 'Migration Fapshi complétée avec succès !' AS result;
