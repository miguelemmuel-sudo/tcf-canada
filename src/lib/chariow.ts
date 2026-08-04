import { PACK_PRICES, PACK_NAMES } from "./fapshi";

export async function initiateChariowPayment({
  amount,
  email,
  externalId,
  message,
  redirectUrl,
  userId,
  pack,
}: {
  amount: number;
  email: string;
  externalId: string;
  message: string;
  redirectUrl: string;
  userId: string;
  pack: string;
}) {
  const chariowSecretKey = process.env.CHARIOW_SECRET_KEY;
  const storeId = process.env.CHARIOW_STORE_ID;
  
  if (!chariowSecretKey) {
    throw new Error("Clé secrète Chariow non configurée.");
  }

  // Construct payload based on standard payment gateways for Chariow
  const payload = {
    amount: amount,
    currency: "XAF", // Or let it be dynamically passed
    customer_email: email,
    customer_name: "Candidat TCF", // Could be dynamically passed
    description: message,
    return_url: redirectUrl, // Where user is redirected after payment (Success)
    cancel_url: `${redirectUrl}&status=canceled`, // Where user is redirected after cancellation
    reference: externalId,
    metadata: {
      user_id: userId,
      pack: pack,
    },
    store_id: storeId, // Often required
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

    return {
      paymentUrl: data.checkout_url || data.url || data.paymentUrl || data.link, 
      transId: data.transaction_id || data.id || externalId,
    };
  } catch (error: any) {
    console.error("[Chariow] Exception:", error.message);
    throw new Error("Impossible d'initialiser le paiement Chariow : " + error.message);
  }
}
