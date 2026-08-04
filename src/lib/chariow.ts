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
