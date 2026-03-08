type JsonValue =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

interface BusinessInfo {
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  productOrService?: string;
  mainObjective?: string;
  tone?: string;
  budget?: number | string;
  language?: string;
  [key: string]: unknown;
}

interface SwotUserInputs {
  notesInternes?: string;
  notesExternes?: string;
  concurrents?: string[];
  ressources?: string[];
  objectifs?: string;
  [key: string]: unknown;
}

function toPrettyJson(value: JsonValue | undefined): string {
  return JSON.stringify(value ?? {}, null, 2);
}

export function buildSwotFromStrategyPrompt(
  strategyJson: JsonValue,
  businessInfo: BusinessInfo = {},
  userInputs: SwotUserInputs = {},
): string {
  const context = {
    businessInfo,
    userInputs,
  };

  return `Tu es un consultant senior en strategie marketing.

Tache:
1. Analyse la strategie marketing fournie (Avant/Pendant/Apres).
2. Croise cette strategie avec le contexte business et les inputs utilisateur.
3. Produis un SWOT professionnel, concret et directement exploitable.

Contexte business + inputs:
${toPrettyJson(context)}

Strategie a analyser:
${toPrettyJson(strategyJson)}

Regles obligatoires:
- Sortie unique: un objet JSON valide.
- Structure EXACTE:
{
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": []
}
- Maximum 6 elements par liste.
- Chaque element doit etre specifique au contexte (pas de formulation generique).
- Evite les doublons, formulations vagues et banalites.
- Formulation orientee action/impact business.
- Langue: ${businessInfo.language ? `Reponds ENTIEREMENT en ${businessInfo.language}. Tous les elements doivent etre rediges en ${businessInfo.language}.` : 'Detecte la langue depuis le contexte business et les inputs, puis reponds dans cette meme langue de facon coherente.'}
- Pas de blabla.
- JSON strict.
- Interdit: markdown, commentaires, texte hors JSON.

Retourne uniquement le JSON final.`;
}

export function buildImproveSwotPrompt(
  strategyJson: JsonValue,
  currentSwot: JsonValue,
  userInputs: SwotUserInputs = {},
  instruction = '',
): string {
  const normalizedInstruction =
    instruction?.trim() ||
    'Ameliore la precision et la valeur actionnable du SWOT.';

  return `Tu es un consultant senior en strategie marketing.

Tache:
1. Analyse la strategie (Avant/Pendant/Apres), le SWOT actuel et les inputs utilisateur.
2. Ameliore le SWOT pour le rendre plus precis, actionnable et utile a la decision.
3. Conserve la structure SWOT stricte.

Strategie:
${toPrettyJson(strategyJson)}

SWOT actuel:
${toPrettyJson(currentSwot)}

Inputs utilisateur:
${toPrettyJson(userInputs)}

Instruction specifique:
${normalizedInstruction}

Regles obligatoires:
- Sortie unique: un objet JSON valide.
- Structure EXACTE:
{
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": []
}
- Maximum 6 elements par liste.
- Supprime le generique, garde le concret et contextualise.
- Ameliore la clarte et l'utilite actionnable de chaque point.
- Evite les doublons et les points non verificables.
- Langue: ${(userInputs as BusinessInfo).language ? `Reponds ENTIEREMENT en ${(userInputs as BusinessInfo).language}.` : 'Reponds dans la meme langue que le contexte business fourni.'}
- Pas de blabla.
- JSON strict.
- Interdit: markdown, commentaires, texte hors JSON.

Retourne uniquement le JSON final.`;
}
