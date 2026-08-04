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
  
  if (!chariowSecretKey) {
    throw new Error("Clé secrète Chariow non configurée.");
  }

  const productId = CHARIOW_PRODUCT_IDS[pack] || CHARIOW_PRODUCT_IDS.griffon;

  const payload = {
    product_id: productId,
    email: email || "candidat@griffondortcfcanada.com",
    first_name: "Candidat",
    last_name: "TCF",
    phone: {
      number: "677123456",
      country_code: "CM"
    },
    redirect_url: redirectUrl,
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

    return {
      paymentUrl: data.checkout_url || data.url || data.paymentUrl || data.link, 
      transId: data.transaction_id || data.id || externalId,
    };
  } catch (error: any) {
    console.error("[Chariow] Exception:", error.message);
    throw new Error("Impossible d'initialiser le paiement Chariow : " + error.message);
  }
}
