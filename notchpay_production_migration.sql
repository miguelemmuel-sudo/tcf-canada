-- ====================================================================
-- MIGRATION SQL NOTCH PAY (ENVIRONNEMENT DE PRODUCTION)
-- Projet : TCF Canada Pro (Griffon d'OR)
-- Administrateur Réseau : Miguel
-- ====================================================================

-- 1. ADAPTATION ET HARMONISATION DE LA TABLE TRANSACTIONS
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS pack TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS webhook_status TEXT DEFAULT 'unprocessed';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'NotchPay';

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_tx_id ON public.transactions(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_webhook_status ON public.transactions(webhook_status);

-- 2. ADAPTATION ET HARMONISATION DE LA TABLE SUBSCRIPTIONS
DO $$
BEGIN
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS pack TEXT DEFAULT 'griffon'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS amount TEXT DEFAULT '25000'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA'; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END;
  BEGIN ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END;
END $$;

-- Rendre la contrainte de clé primaire propre sur id
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey CASCADE;
    ALTER TABLE public.subscriptions ADD PRIMARY KEY (id);
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires_at ON public.subscriptions(status, expires_at);

-- 3. GARANTIR LA COLONNE SUBSCRIPTION_TYPE SUR PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'griffon';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 4. TABLE PAYMENT_LOGS POUR TRACABILITÉ ABSOLUE DES WEBHOOKS NOTCH PAY
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

-- 5. NOTIFICATIONS
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';

-- 6. POLITIQUES DE SÉCURITÉ RLS ET ACCÈS POUR L'ADMINISTRATEUR
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Transactions select user" ON public.transactions;
CREATE POLICY "Transactions select user" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions admin all" ON public.transactions;
CREATE POLICY "Transactions admin all" ON public.transactions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Subscriptions select user" ON public.subscriptions;
CREATE POLICY "Subscriptions select user" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Subscriptions admin all" ON public.subscriptions;
CREATE POLICY "Subscriptions admin all" ON public.subscriptions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Payment logs admin all" ON public.payment_logs;
CREATE POLICY "Payment logs admin all" ON public.payment_logs FOR ALL USING (public.is_admin());

-- 7. ACTIVATION REALTIME
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

SELECT 'Migration SQL Notch Pay pour Production exécutée avec succès !' AS result;
