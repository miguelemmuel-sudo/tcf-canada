import { PACK_PRICES, PACK_NAMES } from "./fapshi";

export const CHARIOW_PRODUCT_IDS: Record<string, string> = {
  standard: "prd_2z2jdzpe",
  griffon: "prd_fr3hvruv",
  vip: "prd_9djo3fww",
};

export async function initiateChariowPayment({
  amount,
  email,
  externalId,
  message,
  redirectUrl,
  userId,
  pack,
  phoneNumber,
}: {
  amount: number;
  email: string;
  externalId: string;
  message: string;
  redirectUrl: string;
  userId: string;
  pack: string;
  phoneNumber?: string;
}) {
  const chariowSecretKey = process.env.CHARIOW_SECRET_KEY;
  
  if (!chariowSecretKey) {
    throw new Error("Clé secrète Chariow non configurée.");
  }

  const productId = CHARIOW_PRODUCT_IDS[pack] || CHARIOW_PRODUCT_IDS.griffon;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://griffondortcfcanada.com";
  const payload = {
    product_id: productId,
    email: email || "candidat@griffondortcfcanada.com",
    first_name: "Candidat",
    last_name: "TCF",
    phone: {
      number: phoneNumber || "677123456",
      country_code: "CM"
    },
    redirect_url: redirectUrl,
    webhook_url: `${baseUrl}/api/webhooks/chariow`,
    metadata: {
      user_id: userId,
      pack: pack,
      reference: externalId
    }
  };

  try {
    const response = await fetch("https://api.chariow.com/v1/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${chariowSecretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Chariow] Erreur API:", data);
      throw new Error(data.message || data.error || "Erreur de communication avec Chariow.");
    }

    // L'API Chariow renvoie souvent un objet `data` imbriqué
    const nestedData = data.data || data;
    const paymentInfo = nestedData.payment || nestedData;

    return {
      paymentUrl: paymentInfo.checkout_url || paymentInfo.url || paymentInfo.paymentUrl || paymentInfo.link, 
      transId: paymentInfo.transaction_id || paymentInfo.id || externalId,
    };
  } catch (error: any) {
    console.error("[Chariow] Exception:", error.message);
    throw new Error("Impossible d'initialiser le paiement Chariow : " + error.message);
  }
}

/**
 * Vérification active de l'état d'un paiement (Server-to-Server)
 * Permet de valider une transaction sans attendre le webhook.
 */
export async function verifyChariowPayment(transactionId: string): Promise<{
  success: boolean;
  status: string;
  data?: any;
}> {
  const chariowSecretKey = process.env.CHARIOW_SECRET_KEY;
  if (!chariowSecretKey) {
    console.error("[Chariow] Clé secrète non configurée.");
    return { success: false, status: "error" };
  }

  try {
    // Note: If Moneroo's API is api.moneroo.io, we will attempt api.chariow.com first as per checkout endpoint
    const response = await fetch(`https://api.chariow.com/v1/payments/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${chariowSecretKey}`,
      },
      // Timeout to avoid hanging the active check
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn(`[Chariow Verify] L'API a retourné une erreur pour ${transactionId}:`, data);
      return { success: false, status: "pending" }; // Fallback to pending if we can't actively verify
    }

    const paymentInfo = data.data?.payment || data.data || data;
    const rawStatus = (paymentInfo.status || "").toUpperCase();

    // Mapping du statut (SUCCESSFUL / COMPLETED)
    if (rawStatus === "SUCCESSFUL" || rawStatus === "COMPLETED") {
      return { success: true, status: "completed", data: paymentInfo };
    } else if (rawStatus === "FAILED" || rawStatus === "CANCELLED") {
      return { success: false, status: "failed", data: paymentInfo };
    }

    return { success: false, status: "pending", data: paymentInfo };
  } catch (err: any) {
    console.error(`[Chariow Verify] Erreur lors de la vérification active de ${transactionId}:`, err.message);
    return { success: false, status: "pending" }; // In case of network timeout, return pending so Webhook can take over
  }
}
