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

function getPlatformTypes(platform: string): string[] {
  const lower = platform.toLowerCase();
  if (lower === 'instagram') return ['reel', 'story', 'carousel', 'post'];
  if (lower === 'tiktok') return ['video', 'story'];
  if (lower === 'facebook') return ['post', 'reel', 'story'];
  if (lower === 'linkedin') return ['post', 'article', 'story'];
  if (lower === 'youtube') return ['short', 'video'];
  if (lower === 'x') return ['tweet', 'thread'];
  if (lower === 'pinterest') return ['pin', 'idea_pin'];
  if (lower === 'snapchat') return ['story', 'snap'];
  if (lower === 'threads') return ['post', 'thread'];
  return ['post'];
}

function getPlatformStyleRule(platform: string): string {
  const lower = platform.toLowerCase();
  const types = getPlatformTypes(platform);
  const typesStr = types.join(', ');

  if (lower === 'instagram') {
    return `${platform} (types possibles: ${typesStr}): varie les types (reel=video courte immersive, story=ephemere interactif, carousel=contenu multi-slides, post=image statique). title = titre accrocheur du contenu. caption avec hashtags, ton brand aspiration nel.`;
  }
  if (lower === 'tiktok') {
    return `${platform} (types possibles: ${typesStr}): video=contenu principal, story=format ephemere. title = titre du video/story (court, hook implicite). Hook ultra-fort en premiere phrase, ton dynamique natif Gen Z, description courte orientee contexte video.`;
  }
  if (lower === 'facebook') {
    return `${platform} (types possibles: ${typesStr}): post=texte+image, reel=video courte, story=ephemere. title = titre de la publication. Plus descriptif, audience large, CTA clair, ton accessible.`;
  }
  if (lower === 'linkedin') {
    return `${platform} (types possibles: ${typesStr}): post=publication standard, article=long form, story=ephemere. title = titre professionnel. Ton expert, valeur concrete, insights B2B, personnalisation marque employeur.`;
  }
  if (lower === 'youtube') {
    return `${platform} (types possibles: ${typesStr}): short=video <60s, video=long form. title = titre YouTube optimise SEO (60 chars max). Hook video fort, description riche pour algorithme et recherche, CTA explicite.`;
  }
  if (lower === 'x') {
    return `${platform} (types possibles: ${typesStr}): tweet=message court, thread=serie de tweets. title = angle ou theme du tweet/thread. Message impact immediat, conversationnel, concis.`;
  }
  if (lower === 'pinterest') {
    return `${platform} (types possibles: ${typesStr}): pin=epingle standard, idea_pin=serie slides. title = titre PIN optimise SEO (100 chars max). Ton inspirationnel, promesse visuelle claire, description SEO.`;
  }
  if (lower === 'snapchat') {
    return `${platform} (types possibles: ${typesStr}): story=serie snaps, snap=snap unique. title = titre de la story/snap. Ton direct, immersif, message ultra-rapide a consommer.`;
  }
  if (lower === 'threads') {
    return `${platform} (types possibles: ${typesStr}): post=publication, thread=serie. title = sujet ou angle du thread. Ton conversationnel, humain, spontane et engageant.`;
  }

  return `${platform} (types possibles: post): adapte le style natif. title = titre court et percutant. Reste concret et actionnable.`;
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
      const types = getPlatformTypes(platform).join('|');

      return `- ${getPlatformStyleRule(platform)} ${hashtagRule} | type doit etre l'un de: [${types}].`;
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
- Pour chaque plateforme, genere au minimum 2 posts DISTINCTS avec des types differents (ex: reel + story pour Instagram).
- CHAQUE post DOIT obligatoirement inclure: title (titre de l'annonce, court et percutant), type (natif a la plateforme), caption, description (distincte du caption, contexte/accroche supplementaire), hook (court, ultra-percutant), cta (clair et explicite), suggestedVisual (description visuelle concrete), adCopyVariantA, adCopyVariantB, adCopyVariantC (trois variantes distinctes orientees conversion), hashtags.
- title pour ADS = headline de l'annonce (ex: "Decouvrez notre offre exclusive").
- Les ad copies A/B/C doivent proposer 3 angles differents (emotion, benefice, urgence).
- Pour TikTok, Snapchat et YouTube: description distincte et utile pour contexte video.
- hashtags: 5 a 10 si la plateforme est compatible, sinon [].`;
  }

  return `Regles mode CONTENT_MARKETING:
- Definis 3 a 5 content pillars dans campaignSummary.contentPillars.
- Definis campaignSummary.postingPlan.frequencyPerWeek et durationWeeks selon inputs.
- Pour chaque plateforme, genere au minimum 2 posts DISTINCTS avec des types differents (ex: reel + carousel pour Instagram).
- CHAQUE post DOIT obligatoirement inclure: title (titre du contenu, explicite et engageant), type (natif a la plateforme), caption, description (contexte editorial distinct du caption), hook (accroche cognitive courte), cta (soft, invitation naturelle), suggestedVisual (description concrete du visuel), hashtags.
- title pour CONTENT_MARKETING = titre editorial du post (ex: "5 astuces pour doubler votre engagement").
- Les types doivent varier entre les posts d'une meme plateforme.
- Pour TikTok, Snapchat et YouTube: description distincte et utile.
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
  const contentLang = (businessInfo?.language as string)?.trim() || 'auto';
  const langRule = contentLang === 'auto'
    ? 'Detect the language from the business context and user inputs, then write ALL content in that same language consistently.'
    : `${contentLang}. Write EVERY text field (title, caption, description, hook, cta, suggestedVisual, adCopyVariants, contentPillars) entirely in ${contentLang}.`;

  return `Tu es un expert senior en social media et content marketing.

Mission:
1) Analyse la strategie marketing fournie (Avant/Pendant/Apres).
2) Relie cette strategie au contexte business et aux plateformes.
3) Genere du contenu concret dans la langue specifiee.

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
- Langue: ${langRule}
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
      "title": "Titre court et percutant du contenu",
      "caption": "Texte principal du post",
      "description": "Description complementaire et contexte utile, distinct du caption",
      "hook": "Hook ultra-court pour accrocher en 3 secondes",
      "cta": "Appel a l'action explicite",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
      "suggestedVisual": "Description concrete du visuel recommande",
      "adCopyVariantA": "Variante A - angle emotion",
      "adCopyVariantB": "Variante B - angle benefice",
      "adCopyVariantC": "Variante C - angle urgence"
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
  const contentLang = (businessInfo?.language as string)?.trim() || 'auto';
  const langRule = contentLang === 'auto'
    ? 'Detect the language from the business context and inputs, then write ALL content in that same language.'
    : `${contentLang}. Write EVERY text field entirely in ${contentLang}.`;

  return `Tu es un expert senior en social media et content marketing.

Mission:
1) Analyse la strategie (Avant/Pendant/Apres).
2) Analyse les posts existants de la plateforme ${platform}.
3) Regenere uniquement des posts pour ${platform} dans la langue specifiee.

Mode: ${normalizedMode}
Plateforme cible unique: ${platform}

Guide style plateforme:
- ${getPlatformStyleRule(platform)}
- ${isHashtagCompatible(platform) ? 'hashtags: 5 a 10, tableau de strings sans #.' : 'hashtags: tableau vide [].'}
- type doit etre l'un de: [${getPlatformTypes(platform).join(', ')}]. Varie les types entre posts.

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
- Langue: ${langRule}
- platform doit toujours etre "${platform}".
- JSON valide uniquement.
- Interdit: markdown, commentaires, texte hors JSON.
- CHAQUE post DOIT avoir: title, type, caption, description, hook, cta, suggestedVisual, hashtags.

${
  normalizedMode === ContentMode.ADS
    ? `Regles ADS:
- Genere au minimum 2 posts DISTINCTS avec types differents.
- title = headline de l'annonce (court et percutant).
- Chaque post inclut adCopyVariantA (angle emotion), adCopyVariantB (angle benefice), adCopyVariantC (angle urgence).
- description distincte du caption.
- hashtags: 5 a 10 si compatible, sinon [].`
    : `Regles CONTENT_MARKETING:
- Genere au minimum 2 posts DISTINCTS avec types differents.
- title = titre editorial du contenu (explicite et engageant).
- description = contexte editorial distinct du caption.
- hook = accroche cognitive courte.
- cta soft, invitation naturelle.
- hashtags: 5 a 10 si compatible, sinon [].`
}

Format de sortie strict:
{
  "generatedPosts": [
    {
      "platform": "${platform}",
      "type": "post",
      "title": "Titre court et percutant",
      "caption": "Texte principal du post",
      "description": "Description complementaire distincte du caption",
      "hook": "Hook ultra-court",
      "cta": "Appel a l'action",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
      "suggestedVisual": "Description concrete du visuel",
      "adCopyVariantA": "Variante A - angle emotion",
      "adCopyVariantB": "Variante B - angle benefice",
      "adCopyVariantC": "Variante C - angle urgence"
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
  const contentLang = (businessInfo?.language as string)?.trim() || 'auto';
  const langRule = contentLang === 'auto'
    ? 'Detect the language from the business context and inputs, then write ALL content in that same language.'
    : `${contentLang}. Write EVERY text field entirely in ${contentLang}.`;

  return `Tu es un expert senior en social media et content marketing.

Mission:
1) Analyse la strategie (Avant/Pendant/Apres).
2) Analyse le post existant.
3) Regenere un seul post pour ${platform} dans la langue specifiee.

Mode: ${normalizedMode}
Plateforme cible: ${platform}

Guide style plateforme:
- ${getPlatformStyleRule(platform)}
- ${isHashtagCompatible(platform) ? 'hashtags: 5 a 10, tableau de strings sans #.' : 'hashtags: tableau vide [].'}
- type doit etre l'un de: [${getPlatformTypes(platform).join(', ')}].

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
- Langue: ${langRule}
- platform doit toujours etre "${platform}".
- JSON valide uniquement.
- Interdit: markdown, commentaires, texte hors JSON.
- Le post DOIT avoir: title, type, caption, description, hook, cta, suggestedVisual, hashtags.

${
  normalizedMode === ContentMode.ADS
    ? `Regles ADS:
- title = headline de l'annonce (court et percutant).
- Le post inclut adCopyVariantA (emotion), adCopyVariantB (benefice), adCopyVariantC (urgence).
- description distincte et utile.
- hashtags: 5 a 10 si compatible, sinon [].`
    : `Regles CONTENT_MARKETING:
- title = titre editorial du contenu (explicite, engageant).
- description = contexte editorial distinct du caption.
- hook = accroche cognitive courte.
- cta soft, naturel.
- hashtags: 5 a 10 si compatible, sinon [].`
}

Format de sortie strict (objet post uniquement):
{
  "platform": "${platform}",
  "type": "post",
  "title": "Titre court et percutant",
  "caption": "Texte principal du post",
  "description": "Description complementaire distincte du caption",
  "hook": "Hook ultra-court",
  "cta": "Appel a l'action",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "suggestedVisual": "Description concrete du visuel",
  "adCopyVariantA": "Variante A - angle emotion",
  "adCopyVariantB": "Variante B - angle benefice",
  "adCopyVariantC": "Variante C - angle urgence"
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
  const contentLang = (businessInfo?.language as string)?.trim() || 'auto';
  const langRule = contentLang === 'auto'
    ? 'Detect the language from the business context and respond in that same language.'
    : `Respond entirely in ${contentLang}. All notes and labels must be in ${contentLang}.`;

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
- Langue: ${langRule}
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
