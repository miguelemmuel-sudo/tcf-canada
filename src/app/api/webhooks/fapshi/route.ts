import { POST as webhookPost, GET as webhookGet } from "@/app/api/webhooks/notchpay/route";

/**
 * Route aliasée – Compatibilité ancienne URL Fapshi → redirigée vers Notch Pay
 * (Administrateur réseau Miguel – Migration Fapshi → Notch Pay)
 * URL: https://tcf-canada-olive.vercel.app/api/webhooks/fapshi
 *      → Alias de: https://tcf-canada-olive.vercel.app/api/webhooks/notchpay
 */
export async function POST(req: Request) {
  return webhookPost(req);
}

export async function GET() {
  return webhookGet();
}
