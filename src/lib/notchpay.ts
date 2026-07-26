import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────
// Configuration Notch Pay – Administrateur réseau Miguel
// ─────────────────────────────────────────────────────────────────
const NOTCHPAY_PUBLIC_KEY = process.env.NOTCHPAY_PUBLIC_KEY || "";
const NOTCHPAY_PRIVATE_KEY = process.env.NOTCHPAY_PRIVATE_KEY || "";
const NOTCHPAY_HASH_SECRET = process.env.NOTCHPAY_HASH_SECRET || "";
const NOTCHPAY_ENV = (process.env.NOTCHPAY_ENV || "test").toLowerCase();

// Base URL officielle Notch Pay (sandbox = api.notchpay.co en mode test)
const BASE_URL = "https://api.notchpay.co";

// ─────────────────────────────────────────────────────────────────
// Client Supabase Admin (server-side only)
// ─────────────────────────────────────────────────────────────────
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) return null;
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ─────────────────────────────────────────────────────────────────
// Logging des événements de paiement dans Supabase (payment_logs)
// ─────────────────────────────────────────────────────────────────
export async function logNotchPayEvent(
  userId: string | null,
  reference: string | null,
  eventType:
    | "initiate"
    | "webhook_received"
    | "webhook_processed"
    | "webhook_error"
    | "status_check"
    | "error",
  payload: any
) {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) return;
    await supabase.from("payment_logs").insert({
      user_id: userId || null,
      transaction_reference: reference || null,
      event_type: eventType,
      payload: typeof payload === "object" ? payload : { raw: payload },
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[NotchPay Log Error]", err);
  }
}

// ─────────────────────────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────────────────────────
export interface InitiatePaymentParams {
  amount: number;           // Montant en XAF (FCFA)
  currency?: string;        // "XAF" par défaut
  email: string;            // Email obligatoire pour Notch Pay
  phone?: string;
  name?: string;
  reference: string;        // Référence unique (ex: TCF_xxxxxxxx_timestamp)
  description?: string;
  callbackUrl?: string;     // URL du webhook Notch Pay
  returnUrl?: string;       // URL de retour après paiement
  userId?: string;          // Notre ID utilisateur interne
}

export interface InitiatePaymentResponse {
  paymentUrl: string;       // URL de redirection vers la page de paiement Notch Pay
  transactionRef: string;   // Référence de la transaction Notch Pay
  status: string;
  message?: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: "pending" | "complete" | "failed" | "canceled" | "incomplete";
  amount?: number;
  currency?: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
  };
  initiated_at?: string;
  paid_at?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────
// Initialisation d'un paiement (Payment Initialize)
// ─────────────────────────────────────────────────────────────────
export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<InitiatePaymentResponse> {
  if (!NOTCHPAY_PUBLIC_KEY) {
    const errorMsg =
      "Clé publique Notch Pay (NOTCHPAY_PUBLIC_KEY) non configurée dans les variables d'environnement.";
    await logNotchPayEvent(params.userId || null, params.reference, "error", {
      error: errorMsg,
      params,
    });
    throw new Error(errorMsg);
  }

  const endpoint = `${BASE_URL}/payments`;

  const bodyPayload: Record<string, any> = {
    amount: Math.round(params.amount),
    currency: params.currency || "XAF",
    email: params.email,
    reference: params.reference,
    description:
      params.description ||
      `Abonnement TCF Canada Pro – Réf: ${params.reference}`,
  };

  if (params.phone) bodyPayload.phone = params.phone;
  if (params.name) bodyPayload.name = params.name;
  if (params.callbackUrl) bodyPayload.callback = params.callbackUrl;
  if (params.returnUrl) bodyPayload.return_url = params.returnUrl;

  try {
    await logNotchPayEvent(params.userId || null, params.reference, "initiate", {
      endpoint,
      payload: bodyPayload,
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: NOTCHPAY_PUBLIC_KEY,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json();

    if (!response.ok || !data.authorization_url) {
      const errorDetail =
        data.message ||
        data.error ||
        JSON.stringify(data) ||
        "Erreur inconnue lors de l'initialisation Notch Pay";
      await logNotchPayEvent(
        params.userId || null,
        params.reference,
        "error",
        { status: response.status, data }
      );
      throw new Error(
        `Erreur Notch Pay (${response.status}): ${errorDetail}`
      );
    }

    return {
      paymentUrl: data.authorization_url,
      transactionRef: data.transaction?.reference || params.reference,
      status: data.transaction?.status || "pending",
      message: data.message,
    };
  } catch (err: any) {
    await logNotchPayEvent(params.userId || null, params.reference, "error", {
      message: err.message,
      stack: err.stack,
    });
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────
// Vérification du statut d'un paiement
// ─────────────────────────────────────────────────────────────────
export async function getPaymentStatus(
  reference: string
): Promise<PaymentStatusResponse> {
  if (!NOTCHPAY_PRIVATE_KEY) {
    throw new Error(
      "Clé privée Notch Pay (NOTCHPAY_PRIVATE_KEY) non configurée."
    );
  }

  const endpoint = `${BASE_URL}/payments/${encodeURIComponent(reference)}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: NOTCHPAY_PRIVATE_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Erreur statut Notch Pay (${response.status}): ${
          data.message || JSON.stringify(data)
        }`
      );
    }

    await logNotchPayEvent(null, reference, "status_check", data);

    // Notch Pay retourne `data.transaction` ou `data.payment`
    const tx = data.transaction || data.payment || data;
    return {
      reference: tx.reference || reference,
      status: tx.status || "pending",
      amount: tx.amount,
      currency: tx.currency,
      customer: tx.customer,
      initiated_at: tx.initiated_at || tx.created_at,
      paid_at: tx.paid_at || tx.updated_at,
      description: tx.description,
    } as PaymentStatusResponse;
  } catch (err: any) {
    await logNotchPayEvent(null, reference, "error", {
      action: "getPaymentStatus",
      error: err.message,
    });
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────
// Vérification de la signature Webhook Notch Pay (HMAC-SHA256)
// ─────────────────────────────────────────────────────────────────
export function verifyNotchPayWebhook(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  if (!NOTCHPAY_HASH_SECRET) {
    if (NOTCHPAY_ENV === "test") {
      console.warn(
        "[NotchPay Security Warning] NOTCHPAY_HASH_SECRET non défini en mode test. Webhook accepté par défaut."
      );
      return true;
    }
    console.error("[NotchPay Security] NOTCHPAY_HASH_SECRET manquant en production !");
    return false;
  }

  if (!signatureHeader) {
    console.warn("[NotchPay Webhook] En-tête x-notch-signature absent.");
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", NOTCHPAY_HASH_SECRET);
    const expectedSignature = hmac.update(rawBody).digest("hex");

    console.log("[NotchPay Webhook HMAC] signature reçue:", signatureHeader.slice(0, 16) + "...");
    console.log("[NotchPay Webhook HMAC] signature attendue:", expectedSignature.slice(0, 16) + "...");

    // Le header peut être hex (64 chars) ou parfois la clé elle-même
    // Comparaison directe en string d'abord (le plus courant avec Notch Pay)
    if (signatureHeader === expectedSignature) {
      return true;
    }

    // Essai comparaison via timingSafeEqual (buffers doivent avoir la même longueur)
    const sigBuf = Buffer.from(signatureHeader, "utf-8");
    const expBuf = Buffer.from(expectedSignature, "utf-8");

    if (sigBuf.length !== expBuf.length) {
      console.warn(
        `[NotchPay Webhook] Longueurs signatures différentes: reçue=${sigBuf.length}, attendue=${expBuf.length}. Comparaison directe.`
      );
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (err) {
    console.error("[NotchPay Webhook] Erreur vérification HMAC:", err);
    return false;
  }
}

export function getNotchPayEnv(): string {
  return NOTCHPAY_ENV;
}
