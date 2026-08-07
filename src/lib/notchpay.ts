export interface NotchPayPaymentPayload {
  email: string;
  currency: string;
  amount: number;
  reference: string;
  description: string;
  callback?: string;
}

export async function initiateNotchPayPayment(payload: NotchPayPaymentPayload) {
  const url = "https://api.notchpay.co/payments/initialize";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NOTCHPAY_PUBLIC_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data;
}

export async function verifyNotchPayPayment(reference: string) {
  const url = `https://api.notchpay.co/payments/${reference}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.NOTCHPAY_PRIVATE_KEY}`,
      "Accept": "application/json"
    }
  });

  const data = await response.json();
  return data;
}
