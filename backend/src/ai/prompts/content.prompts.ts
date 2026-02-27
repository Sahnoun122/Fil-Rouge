import { ContentMode } from '../../content/schemas/content-campaign.schema';

type JsonObject = Record<string, unknown>;

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function normalizeMode(mode: ContentMode | string): ContentMode {
  return String(mode).toUpperCase() === ContentMode.ADS
    ? ContentMode.ADS
    : ContentMode.CONTENT_MARKETING;
}

function normalizePlatforms(platforms: string[]): string[] {
  return Array.from(
    new Set(
      (platforms ?? [])
        .map((platform) => String(platform ?? '').trim())
        .filter((platform) => platform.length > 0),
    ),
  );
}

function getPlatformStyleRule(platform: string): string {
  const lower = platform.toLowerCase();

  if (lower === 'tiktok') {
    return `${platform}: tres court, hook fort, ton dynamique.`;
  }
  if (lower === 'instagram') {
    return `${platform}: caption avec hashtags, ton brand.`;
  }
  if (lower === 'facebook') {
    return `${platform}: plus descriptif, CTA clair.`;
  }
  if (lower === 'linkedin') {
    return `${platform}: ton professionnel, valeur et conseils.`;
  }

  return `${platform}: adapte le style natif de la plateforme, reste concret et actionnable.`;
}

function isHashtagCompatible(platform: string): boolean {
  const lower = platform.toLowerCase();
  return (
    lower === 'instagram' ||
    lower === 'tiktok' ||
    lower === 'facebook' ||
    lower === 'linkedin' ||
    lower === 'x' ||
    lower === 'youtube'
  );
}

function getPlatformGuide(platforms: string[]): string {
  return normalizePlatforms(platforms)
    .map((platform) => {
      const hashtagRule = isHashtagCompatible(platform)
        ? 'hashtags: 5 a 10, tableau de strings sans #.'
        : 'hashtags: tableau vide [].';

      return `- ${getPlatformStyleRule(platform)} ${hashtagRule}`;
    })
    .join('\n');
}

function resolveFrequencyPerWeek(inputs: JsonObject): number {
  const raw = Number(inputs?.frequencyPerWeek);
  if (Number.isInteger(raw) && raw > 0) {
    return raw;
  }

  return 3;
}

function resolveDurationWeeks(inputs: JsonObject): number {
  const startDate = new Date(String(inputs?.startDate ?? ''));
  const endDate = new Date(String(inputs?.endDate ?? ''));

  if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs >= 0) {
      return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
    }
  }

  return 4;
}

function buildModeRules(mode: ContentMode): string {
  if (mode === ContentMode.ADS) {
    return `Regles mode ADS:
- Pour chaque plateforme, genere au minimum 2 posts.
- Chaque post doit inclure: adCopyVariantA, adCopyVariantB, adCopyVariantC, hook (court), caption, cta (clair), suggestedVisual.
- hashtags: 5 a 10 si la plateforme est compatible, sinon [].
- Les ad copies doivent etre distinctes (A/B/C) et orientees conversion.`;
  }

  return `Regles mode CONTENT_MARKETING:
- Definis 3 a 5 content pillars dans campaignSummary.contentPillars.
- Definis campaignSummary.postingPlan.frequencyPerWeek selon inputs.frequencyPerWeek (sinon valeur par defaut).
- Definis campaignSummary.postingPlan.durationWeeks selon inputs (sinon valeur par defaut).
- Pour chaque plateforme, genere au minimum 2 posts adaptes au format natif.
- Chaque post doit inclure: format/type, caption, hook, cta (soft), suggestedVisual.
- hashtags: 5 a 10 si la plateforme est compatible, sinon [].`;
}

export function buildGenerateContentCampaignPrompt(
  strategyJson: JsonObject,
  businessInfo: JsonObject,
  mode: ContentMode | string,
  platforms: string[],
  inputs: JsonObject,
  instruction?: string,
): string {
  const normalizedMode = normalizeMode(mode);
  const normalizedPlatforms = normalizePlatforms(platforms);
  const frequencyPerWeek = resolveFrequencyPerWeek(inputs ?? {});
  const durationWeeks = resolveDurationWeeks(inputs ?? {});

  return `Tu es un expert senior en social media et content marketing.

Mission:
1) Analyse la strategie marketing fournie (Avant/Pendant/Apres).
2) Relie cette strategie au contexte business et aux plateformes.
3) Genere du contenu concret, en francais uniquement.

Mode: ${normalizedMode}
Plateformes cibles: ${normalizedPlatforms.join(', ') || 'Aucune'}

Guide style par plateforme:
${getPlatformGuide(normalizedPlatforms)}

Contexte business:
${toPrettyJson(businessInfo)}

Strategie a analyser (Avant/Pendant/Apres):
${toPrettyJson(strategyJson)}

Inputs utilisateur:
${toPrettyJson(inputs)}

Instruction supplementaire:
${instruction?.trim() || 'Aucune instruction supplementaire.'}

Regles globales:
- Francais uniquement.
- Contenu concret, specifique et actionnable.
- JSON valide uniquement.
- Interdit: markdown, commentaires, texte hors JSON.
- Garde platform strictement dans la liste cible.

${buildModeRules(normalizedMode)}

Format de sortie strict:
{
  "campaignSummary": {
    "contentPillars": ["pillar 1", "pillar 2", "pillar 3"],
    "postingPlan": {
      "frequencyPerWeek": ${frequencyPerWeek},
      "durationWeeks": ${durationWeeks}
    }
  },
  "generatedPosts": [
    {
      "platform": "Instagram",
      "type": "reel",
      "caption": "Texte principal",
      "hook": "Hook court",
      "cta": "CTA",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
      "suggestedVisual": "Suggestion de visuel",
      "adCopyVariantA": "Variante A",
      "adCopyVariantB": "Variante B",
      "adCopyVariantC": "Variante C"
    }
  ]
}

Retourne uniquement ce JSON final.`;
}

export function buildRegeneratePlatformPrompt(
  strategyJson: JsonObject,
  businessInfo: JsonObject,
  mode: ContentMode | string,
  platform: string,
  existingPostsForPlatform: JsonObject[],
  inputs: JsonObject,
  instruction?: string,
): string {
  const normalizedMode = normalizeMode(mode);

  return `Tu es un expert senior en social media et content marketing.

Mission:
1) Analyse la strategie (Avant/Pendant/Apres).
2) Analyse les posts existants de la plateforme ${platform}.
3) Regenere uniquement des posts pour ${platform}, en francais uniquement.

Mode: ${normalizedMode}
Plateforme cible unique: ${platform}

Guide style plateforme:
- ${getPlatformStyleRule(platform)}
- ${isHashtagCompatible(platform) ? 'hashtags: 5 a 10, tableau de strings sans #.' : 'hashtags: tableau vide [].'}

Contexte business:
${toPrettyJson(businessInfo)}

Strategie a analyser (Avant/Pendant/Apres):
${toPrettyJson(strategyJson)}

Inputs utilisateur:
${toPrettyJson(inputs)}

Posts existants pour ${platform}:
${toPrettyJson(existingPostsForPlatform)}

Instruction supplementaire:
${instruction?.trim() || 'Aucune instruction supplementaire.'}

Regles globales:
- Francais uniquement.
- platform doit toujours etre "${platform}".
- JSON valide uniquement.
- Interdit: markdown, commentaires, texte hors JSON.

${
  normalizedMode === ContentMode.ADS
    ? `Regles ADS:
- Genere au minimum 2 posts.
- Chaque post inclut adCopyVariantA, adCopyVariantB, adCopyVariantC, hook court, caption, cta clair, suggestedVisual.
- hashtags: 5 a 10 si compatible, sinon [].`
    : `Regles CONTENT_MARKETING:
- Genere au minimum 2 posts adaptes a ${platform}.
- Chaque post inclut type, caption, hook, cta soft, suggestedVisual.
- hashtags: 5 a 10 si compatible, sinon [].`
}

Format de sortie strict:
{
  "generatedPosts": [
    {
      "platform": "${platform}",
      "type": "post",
      "caption": "Texte principal",
      "hook": "Hook court",
      "cta": "CTA",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
      "suggestedVisual": "Suggestion de visuel",
      "adCopyVariantA": "Variante A",
      "adCopyVariantB": "Variante B",
      "adCopyVariantC": "Variante C"
    }
  ]
}

Retourne uniquement le JSON final.`;
}

export function buildRegenerateSinglePostPrompt(
  strategyJson: JsonObject,
  businessInfo: JsonObject,
  mode: ContentMode | string,
  platform: string,
  existingPost: JsonObject,
  inputs: JsonObject,
  instruction?: string,
): string {
  const normalizedMode = normalizeMode(mode);

  return `Tu es un expert senior en social media et content marketing.

Mission:
1) Analyse la strategie (Avant/Pendant/Apres).
2) Analyse le post existant.
3) Regenere un seul post pour ${platform}, en francais uniquement.

Mode: ${normalizedMode}
Plateforme cible: ${platform}

Guide style plateforme:
- ${getPlatformStyleRule(platform)}
- ${isHashtagCompatible(platform) ? 'hashtags: 5 a 10, tableau de strings sans #.' : 'hashtags: tableau vide [].'}

Contexte business:
${toPrettyJson(businessInfo)}

Strategie a analyser (Avant/Pendant/Apres):
${toPrettyJson(strategyJson)}

Inputs utilisateur:
${toPrettyJson(inputs)}

Post actuel a regenerer:
${toPrettyJson(existingPost)}

Instruction supplementaire:
${instruction?.trim() || 'Aucune instruction supplementaire.'}

Regles globales:
- Francais uniquement.
- platform doit toujours etre "${platform}".
- JSON valide uniquement.
- Interdit: markdown, commentaires, texte hors JSON.

${
  normalizedMode === ContentMode.ADS
    ? `Regles ADS:
- Le post regenere inclut adCopyVariantA, adCopyVariantB, adCopyVariantC, hook court, caption, cta clair, suggestedVisual.
- hashtags: 5 a 10 si compatible, sinon [].`
    : `Regles CONTENT_MARKETING:
- Le post regenere inclut type, caption, hook, cta soft, suggestedVisual.
- hashtags: 5 a 10 si compatible, sinon [].`
}

Format de sortie strict (objet post uniquement):
{
  "platform": "${platform}",
  "type": "post",
  "caption": "Texte principal",
  "hook": "Hook court",
  "cta": "CTA",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "suggestedVisual": "Suggestion de visuel",
  "adCopyVariantA": "Variante A",
  "adCopyVariantB": "Variante B",
  "adCopyVariantC": "Variante C"
}

Retourne uniquement le JSON final.`;
}

export const buildRegeneratePostPrompt = buildRegenerateSinglePostPrompt;
