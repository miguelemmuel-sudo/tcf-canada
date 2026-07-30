import { POST as webhookPost, GET as webhookGet } from "@/app/api/webhooks/notchpay/route";

/**
 * Route aliasée – Compatibilité ancienne URL Fapshi → redirigée vers Notch Pay
 * (Administrateur réseau Miguel – Migration Fapshi → Notch Pay)
 * URL: https://griffondortcfcanada.com/api/webhooks/fapshi
 *      → Alias de: https://griffondortcfcanada.com/api/webhooks/notchpay
 */
export async function POST(req: Request) {
  return webhookPost(req);
}

export async function GET() {
  return webhookGet();
}
