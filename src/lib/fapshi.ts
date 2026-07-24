import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

// Configuration Fapshi depuis les variables d'environnement Vercel / .env.local (avec fallbacks officiels de test)
const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY || "FAK_TEST_c6caedec7fc928825153";
const FAPSHI_API_USER = process.env.FAPSHI_API_USER || process.env.FAPSHI_API_SECRET || "3aa8a0e2-d174-4420-b35a-dabcc6a0bed0";
const FAPSHI_WEBHOOK_SECRET = process.env.FAPSHI_WEBHOOK_SECRET || "123@Miguel";
const FAPSHI_WEBHOOK_URL = process.env.FAPSHI_WEBHOOK_URL || "https://tcf-canada-olive.vercel.app/api/webhooks/fapshi";
const FAPSHI_ENV = (process.env.FAPSHI_ENV || "sandbox").toLowerCase();

const BASE_URL = FAPSHI_ENV === "live" 
  ? "https://live.fapshi.com" 
  : "https://sandbox.fapshi.com";

// Client Supabase admin pour l'enregistrement des logs de paiement et webhooks
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

/**
 * Enregistre un événement dans la table payment_logs
 */
export async function logFapshiEvent(
  userId: string | null,
  txRef: string | null,
  eventType: "initiate" | "webhook_received" | "webhook_processed" | "webhook_error" | "status_check" | "error",
  payload: any
) {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) return;
    await supabase.from("payment_logs").insert({
      user_id: userId || null,
      transaction_reference: txRef || null,
      event_type: eventType,
      payload: typeof payload === "object" ? payload : { raw: payload },
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error("[Fapshi Log Error]", err);
  }
}

export interface InitiatePayParams {
  amount: number;
  email?: string;
  redirectUrl?: string;
  userId?: string;
  externalId?: string; // Notre référence interne (ex: TCF_UUID_TIMESTAMP)
  message?: string;
}

export interface InitiatePayResponse {
  link: string;
  transId: string;
  dateInitiated?: string;
  message?: string;
  error?: string;
}

export interface DirectPayParams extends InitiatePayParams {
  phone: string; // Numéro Mobile Money requis (ex: 695903205)
  name?: string;
}

export interface PaymentStatusResponse {
  transId: string;
  status: "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
  medium?: string;
  serviceName?: string;
  transType?: string;
  amount?: number;
  revenue?: number;
  payerName?: string;
  email?: string;
  redirectUrl?: string;
  externalId?: string;
  userId?: string;
  dateInitiated?: string;
  dateConfirmed?: string;
  reason?: string;
}

/**
 * Initialise un paiement via la page de paiement hébergée Fapshi (Initiate Pay)
 * Affiche automatiquement tous les moyens disponibles (MTN, Orange, Visa/Mastercard)
 */
export async function initiatePay(params: InitiatePayParams): Promise<InitiatePayResponse> {
  if (!FAPSHI_API_KEY || !FAPSHI_API_USER) {
    const errorMsg = "Clés API Fapshi non configurées dans les variables d'environnement (FAPSHI_API_KEY / FAPSHI_API_USER).";
    await logFapshiEvent(params.userId || null, params.externalId || null, "error", { error: errorMsg, params });
    throw new Error(errorMsg);
  }

  const endpoint = `${BASE_URL}/initiate-pay`;
  const bodyPayload = {
    amount: Math.round(params.amount),
    email: params.email || undefined,
    redirectUrl: params.redirectUrl || undefined,
    userId: params.userId || undefined,
    externalId: params.externalId || undefined,
    message: params.message || `Abonnement TCF-Canada Pro - ${params.externalId || ""}`
  };

  try {
    await logFapshiEvent(params.userId || null, params.externalId || null, "initiate", { endpoint, payload: bodyPayload });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": FAPSHI_API_KEY,
        "apiuser": FAPSHI_API_USER
      },
      body: JSON.stringify(bodyPayload)
    });

    const data = await response.json();

    if (!response.ok || !data.link || !data.transId) {
      const errorDetail = data.message || data.error || JSON.stringify(data) || "Erreur inconnue lors de l'initialisation Fapshi";
      await logFapshiEvent(params.userId || null, params.externalId || null, "error", { status: response.status, data });
      throw new Error(`Erreur Fapshi (${response.status}): ${errorDetail}`);
    }

    return {
      link: data.link,
      transId: data.transId,
      dateInitiated: data.dateInitiated,
      message: data.message
    };
  } catch (err: any) {
    await logFapshiEvent(params.userId || null, params.externalId || null, "error", { message: err.message, stack: err.stack });
    throw err;
  }
}

/**
 * Initialise un paiement direct Mobile Money sans quitter l'application (Direct Pay)
 */
export async function directPay(params: DirectPayParams): Promise<{ transId: string; status?: string; message?: string }> {
  if (!FAPSHI_API_KEY || !FAPSHI_API_USER) {
    throw new Error("Clés API Fapshi non configurées.");
  }

  const endpoint = `${BASE_URL}/direct-pay`;
  const bodyPayload = {
    amount: Math.round(params.amount),
    phone: params.phone,
    email: params.email || undefined,
    name: params.name || undefined,
    userId: params.userId || undefined,
    externalId: params.externalId || undefined,
    message: params.message || `Paiement Direct TCF - ${params.externalId || ""}`
  };

  try {
    await logFapshiEvent(params.userId || null, params.externalId || null, "initiate", { type: "direct-pay", payload: bodyPayload });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": FAPSHI_API_KEY,
        "apiuser": FAPSHI_API_USER
      },
      body: JSON.stringify(bodyPayload)
    });

    const data = await response.json();
    if (!response.ok || !data.transId) {
      throw new Error(`Erreur Direct Pay Fapshi (${response.status}): ${data.message || JSON.stringify(data)}`);
    }

    return {
      transId: data.transId,
      status: data.status,
      message: data.message
    };
  } catch (err: any) {
    await logFapshiEvent(params.userId || null, params.externalId || null, "error", { message: err.message });
    throw err;
  }
}

/**
 * Interroge l'API Fapshi pour vérifier le statut réel d'une transaction
 */
export async function getPaymentStatus(transId: string): Promise<PaymentStatusResponse> {
  if (!FAPSHI_API_KEY || !FAPSHI_API_USER) {
    throw new Error("Clés API Fapshi non configurées.");
  }

  const endpoint = `${BASE_URL}/payment-status/${encodeURIComponent(transId)}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "apikey": FAPSHI_API_KEY,
        "apiuser": FAPSHI_API_USER
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Erreur statut Fapshi (${response.status}): ${data.message || JSON.stringify(data)}`);
    }

    await logFapshiEvent(data.userId || null, data.externalId || transId, "status_check", data);

    return data as PaymentStatusResponse;
  } catch (err: any) {
    await logFapshiEvent(null, transId, "error", { action: "getPaymentStatus", error: err.message });
    throw err;
  }
}

/**
 * Vérifie l'authenticité de la signature Webhook reçue dans l'en-tête x-wh-secret
 */
export function verifyWebhookSignature(secretHeader: string | null | undefined): boolean {
  if (!FAPSHI_WEBHOOK_SECRET) {
    // En mode sandbox ou si le secret n'a pas encore été configuré, on avertit dans les logs
    if (FAPSHI_ENV === "sandbox") {
      console.warn("[Fapshi Security Warning] FAPSHI_WEBHOOK_SECRET non défini en mode Sandbox. Webhook accepté par défaut pour les tests.");
      return true;
    }
    return false;
  }
  return secretHeader === FAPSHI_WEBHOOK_SECRET;
}

export function getFapshiEnv(): string {
  return FAPSHI_ENV;
}
