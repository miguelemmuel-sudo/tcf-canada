-- ====================================================================================
-- SCRIPT D'OPTIMISATION DES INDEX SQL SUPABASE (TCF CANADA PRO - GRIFFON D'OR)
-- Auteur : Équipe d'Ingénierie & Administrateur Réseau Miguel
-- Objectif : Réduire les temps de réponse de la base de données PostgreSQL,
-- accélérer les requêtes pour les zones à forte latence (Afrique centrale) et
-- éliminer les lectures séquentielles coûteuses en CPU.
-- ====================================================================================

-- 1. Table des Progrès de Cours (course_progress)
-- Accès ultra-fréquent lors de l'ouverture du tableau de bord ou d'une leçon.
CREATE INDEX IF NOT EXISTS idx_course_progress_user_course
ON public.course_progress (user_id, course_id);

CREATE INDEX IF NOT EXISTS idx_course_progress_updated_at
ON public.course_progress (updated_at DESC);

-- 2. Table des Sessions Actives & Interrompues (active_sessions)
-- Sollicitée à chaque frappe/clic et lors de la reprise automatique après coupure.
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_sessions_user_key
ON public.active_sessions (user_id, session_key);

-- 3. Table des Profils Candidats (profiles)
-- Indexation par ID (déjà clé primaire, mais sécurisé pour jointures) et par email.
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles (email);

CREATE INDEX IF NOT EXISTS idx_profiles_pack
ON public.profiles (pack);

-- 4. Table de l'Historique et des Résultats d'Examens (exam_results)
-- Utilisée par la pagination de l'historique et le calcul du classement (leaderboard).
CREATE INDEX IF NOT EXISTS idx_exam_results_user_created
ON public.exam_results (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exam_results_score
ON public.exam_results (score DESC);

-- 5. Table de la Messagerie & Assistant IA (messages / ai_conversations si existantes)
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created
ON public.messages (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created
ON public.messages (sender_id, created_at DESC);

-- ====================================================================================
-- RECOMMANDATIONS VERCEL & EDGE RUNTIME POUR L'AFRIQUE CENTRALE :
-- 1. Activer le CDN Vercel et le routage Edge pour servir les pages statiques au plus
--    près des utilisateurs (Nœuds CDN africains / européens).
-- 2. Configurer les en-têtes HTTP de cache sur les routes API statiques :
--    Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
-- ====================================================================================
