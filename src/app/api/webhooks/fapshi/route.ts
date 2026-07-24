import { POST as webhookPost, GET as webhookGet } from "@/app/api/fapshi/webhook/route";

/**
 * Route aliasée pour répondre exactement à l'URL configurée dans le tableau de bord Fapshi par Administrateur réseau Miguel:
 * https://tcf-canada-olive.vercel.app/api/webhooks/fapshi
 */
export async function POST(req: Request) {
  return webhookPost(req);
}

export async function GET(req: Request) {
  return webhookGet(req);
}
