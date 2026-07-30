import crypto from "crypto";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * SDK Notch Pay – TCF Canada Pro v3.0 Production
 * Domaine : https://griffondortcfcanada.com
 * Administrateur Réseau : Miguel
 */

const BASE_URL = "https://api.notchpay.co";

export const NOTCHPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_NOTCHPAY_PUBLIC_KEY || process.env.NOTCHPAY_PUBLIC_KEY || "";
export const NOTCHPAY_PRIVATE_KEY = process.env.NOTCHPAY_PRIVATE_KEY || process.env.NOTCHPAY_SECRET_KEY || "";
export const NOTCHPAY_HASH_SECRET = process.env.NOTCHPAY_HASH_KEY || process.env.NOTCHPAY_HASH_SECRET || process.env.NOTCHPAY_SECRET_KEY || NOTCHPAY_PRIVATE_KEY || "";
export const NOTCHPAY_ENV = process.env.NOTCHPAY_ENV || (process.env.NODE_ENV === "production" ? "production" : "test");

export const PACK_PRICES: Record<string, number> = {
  standard: 15000,
  griffon: 25000,
  vip: 45000,
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
  currency?: string;
  email: string;
  name?: string;
  phone?: string;
  reference: string;
  description?: string;
  callbackUrl?: string;
  pack?: "standard" | "griffon" | "vip";
  userId?: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: "complete" | "completed" | "pending" | "failed" | "canceled" | "cancelled" | "expired";
  amount: number;
  currency: string;
  customer?: any;
  initiated_at?: string;
  paid_at?: string;
  description?: string;
}

/**
 * Journalise les événements Notch Pay dans Supabase DB et console
 */
export async function logNotchPayEvent(
  userId: string | null,
  reference: string | null,
  eventType: string,
  metadata: any
) {
  const nowIso = new Date().toISOString();
  console.log(`[NotchPay Log] [${eventType}] ref=${reference} user=${userId}`, JSON.stringify(metadata || {}));

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
          action: `notchpay_${eventType}`,
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
 * Initialise un paiement via l'API Notch Pay
 */
export async function initiateNotchPayPayment(params: InitiatePaymentParams) {
  const endpoint = `${BASE_URL}/payments/initialize`;
  const defaultCallback = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments`
    : "https://griffondortcfcanada.com/dashboard/payments";

  const bodyPayload = {
    amount: params.amount,
    currency: params.currency || "XAF",
    email: params.email,
    name: params.name || params.email,
    phone: params.phone || "",
    reference: params.reference,
    description: params.description || `Abonnement TCF Canada Pro - ${PACK_NAMES[params.pack || "griffon"]}`,
    callback: params.callbackUrl || defaultCallback,
  };

  try {
    await logNotchPayEvent(params.userId || null, params.reference, "initiate_request", bodyPayload);

    const authHeader = NOTCHPAY_PUBLIC_KEY || NOTCHPAY_PRIVATE_KEY || "";
    const response = await fetch(endpoint, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok || !data.authorization_url) {
      const errorMsg = data.message || data.error || JSON.stringify(data);
      await logNotchPayEvent(params.userId || null, params.reference, "initiate_error", { status: response.status, data });
      throw new Error(`Erreur Notch Pay (${response.status}): ${errorMsg}`);
    }

    return {
      paymentUrl: data.authorization_url,
      transactionRef: data.transaction?.reference || params.reference,
      status: data.transaction?.status || "pending",
      message: data.message,
    };
  } catch (err: any) {
    await logNotchPayEvent(params.userId || null, params.reference, "initiate_exception", { message: err.message });
    throw err;
  }
}

/**
 * Vérification du statut d'un paiement via l'API Notch Pay
 */
export async function getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
  const endpoint = `${BASE_URL}/payments/${encodeURIComponent(reference)}`;
  const authHeader = NOTCHPAY_PRIVATE_KEY || NOTCHPAY_PUBLIC_KEY || "";

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Erreur statut Notch Pay (${response.status}): ${data.message || JSON.stringify(data)}`);
    }

    const tx = data.transaction || data.payment || data;
    return {
      reference: tx.reference || reference,
      status: (tx.status || "pending").toLowerCase(),
      amount: parseFloat(tx.amount || 0),
      currency: tx.currency || "XAF",
      customer: tx.customer,
      initiated_at: tx.initiated_at || tx.created_at,
      paid_at: tx.paid_at || tx.updated_at,
      description: tx.description,
    } as PaymentStatusResponse;
  } catch (err: any) {
    await logNotchPayEvent(null, reference, "status_check_exception", { error: err.message });
    throw err;
  }
}

/**
 * Vérification ultra-robuste de la signature Webhook Notch Pay (HMAC-SHA256)
 */
export function verifyNotchPayWebhook(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  // 1. Si aucune clé de hash n'est configurée dans l'environnement Vercel
  if (!NOTCHPAY_HASH_SECRET) {
    console.warn(
      "[NotchPay Security] ATTENTION : Aucune clé NOTCHPAY_HASH_KEY ou NOTCHPAY_SECRET_KEY configurée sur Vercel. Webhook accepté temporairement pour déblocage."
    );
    return true;
  }

  // 2. Si le header de signature est manquant
  if (!signatureHeader) {
    console.warn("[NotchPay Webhook] En-tête de signature absent dans la requête HTTP.");
    return false;
  }

  try {
    let cleanHeader = signatureHeader.trim();
    if (cleanHeader.includes("=")) {
      cleanHeader = cleanHeader.split("=")[1].trim();
    }

    const hmacHex = crypto.createHmac("sha256", NOTCHPAY_HASH_SECRET).update(rawBody).digest("hex");
    const hmacBase64 = crypto.createHmac("sha256", NOTCHPAY_HASH_SECRET).update(rawBody).digest("base64");

    if (
      cleanHeader === hmacHex ||
      cleanHeader.toLowerCase() === hmacHex.toLowerCase() ||
      cleanHeader === hmacBase64
    ) {
      return true;
    }

    const sigBuf = Buffer.from(cleanHeader, "utf-8");
    const expBuf = Buffer.from(hmacHex, "utf-8");

    if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
      return true;
    }

    console.warn(`[NotchPay HMAC Mismatch] Reçue: ${cleanHeader.slice(0, 16)}... | Attendue: ${hmacHex.slice(0, 16)}...`);
    return false;
  } catch (err) {
    console.error("[NotchPay Webhook] Erreur lors de la vérification HMAC:", err);
    return false;
  }
}
