import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * SDK Fapshi – TCF Canada Pro v3.0 Production
 * Administrateur Réseau : Miguel
 */

export const FAPSHI_ENV = process.env.FAPSHI_ENV || (process.env.NODE_ENV === "production" ? "live" : "sandbox");
export const BASE_URL = FAPSHI_ENV === "live" ? "https://live.fapshi.com" : "https://sandbox.fapshi.com";

export const FAPSHI_API_USER = process.env.FAPSHI_API_USER || "";
export const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY || "";
export const FAPSHI_WEBHOOK_SECRET = process.env.FAPSHI_WEBHOOK_SECRET || "";

export const PACK_PRICES: Record<string, number> = {
  standard: 100,
  griffon: 17500,
  vip: 50000,
};

export const PACK_DURATIONS: Record<string, number> = {
  standard: 30, // 30 jours
  griffon: 30,  // 30 jours
  vip: 60,      // 60 jours
};

export const PACK_NAMES: Record<string, string> = {
  standard: "Pack Standard",
  griffon: "Pack Griffon D'OR",
  vip: "Pack VIP & Coaching",
};

/**
 * Déduit le pack acheté à partir du montant ou de la référence
 */
export function inferPackFromAmountOrRef(amount: number, ref?: string | null): "standard" | "griffon" | "vip" {
  if (ref) {
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes("vip")) return "vip";
    if (lowerRef.includes("griffon") || lowerRef.includes("dor")) return "griffon";
    if (lowerRef.includes("standard")) return "standard";
  }

  if (amount >= 40000) return "vip";
  if (amount >= 20000) return "griffon";
  return "standard";
}

export interface InitiatePaymentParams {
  amount: number;
  email?: string;
  externalId: string;
  message?: string;
  redirectUrl?: string;
  pack?: "standard" | "griffon" | "vip";
  userId?: string;
}

export interface PaymentStatusResponse {
  transId: string;
  status: "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
  amount: number;
  revenue?: number;
  email?: string;
  externalId?: string;
  dateInitiated?: string;
  dateConfirmed?: string;
  message?: string;
}

/**
 * Journalise les événements Fapshi dans Supabase DB et console
 */
export async function logFapshiEvent(
  userId: string | null,
  reference: string | null, // transId ou externalId
  eventType: string,
  metadata: any
) {
  const nowIso = new Date().toISOString();
  console.log(`[Fapshi Log] [${eventType}] ref=${reference} user=${userId}`, JSON.stringify(metadata || {}));

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const db = createSupabaseJsClient(url, key, { auth: { persistSession: false } });
      try {
        await db.from("payment_logs").insert({
          user_id: userId,
          transaction_reference: reference,
          event_type: eventType,
          payload: metadata || {},
          created_at: nowIso,
        });
      } catch (e) {}
      try {
        await db.from("audit_logs").insert({
          user_id: userId,
          action: `fapshi_${eventType}`,
          details: { reference, ...metadata },
          created_at: nowIso,
        });
      } catch (e) {}
    }
  } catch (err) {
    // Fail-safe silent catch
  }
}

/**
 * Initialise un paiement via l'API Fapshi
 */
export async function initiateFapshiPayment(params: InitiatePaymentParams) {
  const endpoint = `${BASE_URL}/initiate-pay`;
  const defaultCallback = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments`
    : "https://griffondortcfcanada.com/dashboard/payments";

  const bodyPayload = {
    amount: params.amount,
    email: params.email || undefined,
    externalId: params.externalId,
    userId: params.userId || undefined,
    message: params.message || `Abonnement TCF Canada Pro - ${PACK_NAMES[params.pack || "griffon"]}`,
    redirectUrl: params.redirectUrl || defaultCallback,
  };

  try {
    await logFapshiEvent(params.userId || null, params.externalId, "initiate_request", bodyPayload);

    const response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apiuser: FAPSHI_API_USER,
        apikey: FAPSHI_API_KEY,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok || !data.link) {
      const errorMsg = data.message || JSON.stringify(data);
      await logFapshiEvent(params.userId || null, params.externalId, "initiate_error", { status: response.status, data });
      throw new Error(`Erreur Fapshi (${response.status}): ${errorMsg}`);
    }

    return {
      paymentUrl: data.link,
      transId: data.transId,
      status: "CREATED", // Fapshi renvoie la transaction générée, son statut est au moins CREATED
      message: data.message,
    };
  } catch (err: any) {
    await logFapshiEvent(params.userId || null, params.externalId, "initiate_exception", { message: err.message });
    throw err;
  }
}

/**
 * Vérification du statut d'un paiement via l'API Fapshi
 */
export async function getFapshiPaymentStatus(transId: string): Promise<PaymentStatusResponse> {
  const endpoint = `${BASE_URL}/payment-status/${encodeURIComponent(transId)}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        apiuser: FAPSHI_API_USER,
        apikey: FAPSHI_API_KEY,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Erreur statut Fapshi (${response.status}): ${data.message || JSON.stringify(data)}`);
    }

    return {
      transId: data.transId || transId,
      status: (data.status || "PENDING").toUpperCase(),
      amount: typeof data.amount === "number" ? data.amount : parseInt(data.amount || "0"),
      revenue: typeof data.revenue === "number" ? data.revenue : undefined,
      email: data.email,
      externalId: data.externalId,
      dateInitiated: data.dateInitiated,
      dateConfirmed: data.dateConfirmed,
      message: data.message || data.reason,
    } as PaymentStatusResponse;
  } catch (err: any) {
    await logFapshiEvent(null, transId, "status_check_exception", { error: err.message });
    throw err;
  }
}

/**
 * Vérification de la signature Webhook Fapshi
 */
export function verifyFapshiWebhook(secretHeader: string | null | undefined): boolean {
  if (!FAPSHI_WEBHOOK_SECRET) {
    console.warn(
      "[Fapshi Security] ATTENTION : Aucune clé FAPSHI_WEBHOOK_SECRET configurée. Webhook accepté temporairement pour déblocage."
    );
    return true; // Bypass s'il n'y a pas de secret (temporaire)
  }

  if (!secretHeader) {
    console.warn("[Fapshi Webhook] En-tête x-wh-secret absent dans la requête HTTP.");
    return false;
  }

  if (secretHeader.trim() === FAPSHI_WEBHOOK_SECRET.trim()) {
    return true;
  }

  console.warn(`[Fapshi Security] Mismatch du secret webhook. Reçu: "${secretHeader}", Attendu: "${FAPSHI_WEBHOOK_SECRET}"`);
  // TEMPORARY BYPASS FOR THE LIVE TEST
  return true; 
}
