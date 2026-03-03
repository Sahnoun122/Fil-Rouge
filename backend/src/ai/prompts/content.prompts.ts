import { ContentMode } from '../../content/schemas/content-campaign.schema';

type JsonObject = Record<string, unknown>;

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}

function normalizeMode(mode: ContentMode | string): ContentMode {
  return String(mode).toUpperCase() === 'ADS'
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
    return `${platform}: tres court, hook fort, ton dynamique, description courte orientee contexte video.`;
  }
  if (lower === 'snapchat') {
    return `${platform}: ton direct, format story, message tres rapide a consommer, description courte et claire.`;
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
  if (lower === 'youtube') {
    return `${platform}: hook video, description utile pour contexte et recherche, CTA explicite.`;
  }
  if (lower === 'x') {
    return `${platform}: message court, impact immediat, angle conversationnel.`;
  }
  if (lower === 'pinterest') {
    return `${platform}: ton inspirationnel, description SEO courte, promesse visuelle claire.`;
  }
  if (lower === 'threads') {
    return `${platform}: ton conversationnel, humain, spontané et engageant.`;
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
    lower === 'youtube' ||
    lower === 'pinterest' ||
    lower === 'threads'
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
  const startDateValue =
    typeof inputs?.startDate === 'string' ? inputs.startDate : '';
  const endDateValue =
    typeof inputs?.endDate === 'string' ? inputs.endDate : '';
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);

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
- Chaque post doit inclure: adCopyVariantA, adCopyVariantB, adCopyVariantC, hook (court), caption, description, cta (clair), suggestedVisual.
- hashtags: 5 a 10 si la plateforme est compatible, sinon [].
- Pour TikTok, Snapchat et YouTube, la description doit etre pertinente et distincte du caption.
- Les ad copies doivent etre distinctes (A/B/C) et orientees conversion.`;
  }

  return `Regles mode CONTENT_MARKETING:
- Definis 3 a 5 content pillars dans campaignSummary.contentPillars.
- Definis campaignSummary.postingPlan.frequencyPerWeek selon inputs.frequencyPerWeek (sinon valeur par defaut).
- Definis campaignSummary.postingPlan.durationWeeks selon inputs (sinon valeur par defaut).
- Pour chaque plateforme, genere au minimum 2 posts adaptes au format natif.
- Chaque post doit inclure: format/type, caption, description, hook, cta (soft), suggestedVisual.
- Pour TikTok, Snapchat et YouTube, la description doit etre pertinente et distincte du caption.
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
      "description": "Description utile du post",
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
- Chaque post inclut adCopyVariantA, adCopyVariantB, adCopyVariantC, hook court, caption, description, cta clair, suggestedVisual.
- Pour TikTok, Snapchat et YouTube, description distincte et utile.
- hashtags: 5 a 10 si compatible, sinon [].`
    : `Regles CONTENT_MARKETING:
- Genere au minimum 2 posts adaptes a ${platform}.
- Chaque post inclut type, caption, description, hook, cta soft, suggestedVisual.
- Pour TikTok, Snapchat et YouTube, description distincte et utile.
- hashtags: 5 a 10 si compatible, sinon [].`
}

Format de sortie strict:
{
  "generatedPosts": [
    {
      "platform": "${platform}",
      "type": "post",
      "caption": "Texte principal",
      "description": "Description utile du post",
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
- Le post regenere inclut adCopyVariantA, adCopyVariantB, adCopyVariantC, hook court, caption, description, cta clair, suggestedVisual.
- Pour TikTok, Snapchat et YouTube, description distincte et utile.
- hashtags: 5 a 10 si compatible, sinon [].`
    : `Regles CONTENT_MARKETING:
- Le post regenere inclut type, caption, description, hook, cta soft, suggestedVisual.
- Pour TikTok, Snapchat et YouTube, description distincte et utile.
- hashtags: 5 a 10 si compatible, sinon [].`
}

Format de sortie strict (objet post uniquement):
{
  "platform": "${platform}",
  "type": "post",
  "caption": "Texte principal",
  "description": "Description utile du post",
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

export function buildAutoScheduleAdvicePrompt(
  businessInfo: JsonObject,
  strategyJson: JsonObject,
  contentPillars: string[],
  platforms: string[],
  frequencyPerWeek: number,
  startDate: string,
  endDate: string,
): string {
  const normalizedPlatforms = normalizePlatforms(platforms);
  const normalizedPillars = Array.from(
    new Set(
      (contentPillars ?? [])
        .map((pillar) => String(pillar ?? '').trim())
        .filter((pillar) => pillar.length > 0),
    ),
  );

  return `Tu es un expert senior en social media planning.

Mission:
- Proposer des conseils de planification concrets pour un calendrier de contenu.
- Adapter les fenetres horaires et la repartition hebdomadaire selon le contexte business, la strategie et les plateformes.

Contexte business:
${toPrettyJson(businessInfo)}

Strategie marketing:
${toPrettyJson(strategyJson)}

Content pillars:
${toPrettyJson(normalizedPillars)}

Plateformes:
${toPrettyJson(normalizedPlatforms)}

Cadre de planification:
${toPrettyJson({
  frequencyPerWeek,
  startDate,
  endDate,
})}

Regles obligatoires:
- Francais uniquement.
- Concret.
- Pas de blabla.
- Retourner uniquement du JSON strict.
- Pas de markdown.
- Pas de commentaires.
- Les cles de platformRules doivent etre en minuscules.
- Utiliser seulement les plateformes fournies.
- bestWindows doit contenir des strings au format HH:mm-HH:mm.
- weeklyDistribution doit rester coherent avec frequencyPerWeek.
- notes doit contenir des remarques courtes et utiles.

Format de sortie strict:
{
  "platformRules": {
    "instagram": { "bestWindows": ["12:00-14:00", "18:00-21:00"] },
    "tiktok": { "bestWindows": ["19:00-23:00"] }
  },
  "weeklyDistribution": {
    "week1": {
      "instagram": 2,
      "tiktok": 1,
      "facebook": 1
    },
    "week2": {
      "instagram": 1,
      "linkedin": 2,
      "youtube": 1
    }
  },
  "notes": [
    "LinkedIn privilegie les jours ouvrables en matinnee.",
    "TikTok performe mieux en soiree."
  ]
}

Retourne uniquement ce JSON.`;
}
