/**
 * Utility de nettoyage de texte pédagogique – TCF Canada Pro (Griffon d'OR)
 * Administrateur Réseau : Miguel
 * 
 * Éradique tous les symboles parasites (*, **, ####, ###, «, ») des cours et examens
 * pour offrir une lisibilité et une appréciation parfaites sur tous les écrans.
 */

export function cleanTextContent(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";

  return text
    // 1. Supprimer les balises d'en-tête markdown (ex: #### Titre -> Titre)
    .replace(/^#{1,6}\s*/gm, "")
    // 2. Supprimer les astérisques de mise en gras/italique (ex: **texte** -> texte, *texte* -> texte)
    .replace(/\*{1,3}/g, "")
    // 3. Supprimer les guillemets typographiques français (« et »)
    .replace(/[«»]/g, "")
    // 4. Nettoyer les paires de guillemets résiduelles (" " ou "")
    .replace(/""/g, '"')
    // 5. Normaliser les espaces et sauts de ligne multiples
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Nettoie récursivement un objet de leçon ou d'examen (titres, instructions, textes, options, explications)
 */
export function sanitizeLessonOrExam<T>(item: T): T {
  if (!item || typeof item !== "object") return item;

  if (Array.isArray(item)) {
    return item.map((el) => sanitizeLessonOrExam(el)) as any;
  }

  const copy: any = { ...item };

  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (typeof val === "string") {
      copy[key] = cleanTextContent(val);
    } else if (typeof val === "object" && val !== null) {
      copy[key] = sanitizeLessonOrExam(val);
    }
  }

  return copy as T;
}
