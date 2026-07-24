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
-- Indexation par ID (déjà clé primaire, mais sécurisé pour jointures), par email et type d'abonnement.
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles (email);

CREATE INDEX IF NOT EXISTS idx_profiles_subscription
ON public.profiles (subscription_type);

-- 4. Tables de l'Historique, Simulations et Examens (exam_sessions, quiz_results, results)
-- Utilisée par la pagination de l'historique et le calcul du classement (leaderboard).
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_created
ON public.exam_sessions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_score
ON public.exam_sessions (score DESC);

CREATE INDEX IF NOT EXISTS idx_results_user_completed
ON public.results (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed
ON public.quiz_results (user_id, completed_at DESC);

-- 5. Tables de l'Assistant IA & Notifications (ai_conversations, notifications)
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated
ON public.ai_conversations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON public.notifications (user_id) WHERE is_read = false;

-- ====================================================================================
-- RECOMMANDATIONS VERCEL & EDGE RUNTIME POUR L'AFRIQUE CENTRALE :
-- 1. Activer le CDN Vercel et le routage Edge pour servir les pages statiques au plus
--    près des utilisateurs (Nœuds CDN africains / européens).
-- 2. Configurer les en-têtes HTTP de cache sur les routes API statiques :
--    Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
-- ====================================================================================
