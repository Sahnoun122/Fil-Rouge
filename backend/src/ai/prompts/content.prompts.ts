import { ContentMode } from '../../content/schemas/content-campaign.schema';

interface ContentPromptPayload {
  mode: ContentMode;
  platforms: string[];
  businessInfo: Record<string, unknown>;
  strategy: Record<string, unknown>;
  inputs: Record<string, unknown>;
  objective: string;
  instruction?: string;
}

interface RegeneratePlatformPayload extends ContentPromptPayload {
  platform: string;
  existingPlatformPosts: Record<string, unknown>[];
}

interface RegeneratePostPayload extends ContentPromptPayload {
  platform: string;
  existingPost: Record<string, unknown>;
}

function buildPlatformGuide(platforms: string[]): string {
  return platforms
    .map((platform) => {
      const lower = platform.toLowerCase();
      if (lower === 'instagram') {
        return '- Instagram: post, reel, story';
      }
      if (lower === 'tiktok') {
        return '- TikTok: tiktok, short-video';
      }
      if (lower === 'facebook') {
        return '- Facebook: post, story, carousel';
      }
      if (lower === 'linkedin') {
        return '- LinkedIn: post, article, carousel';
      }
      if (lower === 'youtube') {
        return '- YouTube: short, community-post';
      }
      return `- ${platform}: post`;
    })
    .join('\n');
}

export function buildGenerateContentCampaignPrompt(payload: ContentPromptPayload): string {
  const modeHint =
    payload.mode === ContentMode.ADS
      ? 'Create ad copies focused on conversion and include adCopyVariantA/adCopyVariantB whenever relevant.'
      : 'Create editorial/social content focused on relationship and authority building.';

  return `You are a senior social media strategist.

Task: generate platform-specific social copy from the provided strategy.
Language: French only.

MODE: ${payload.mode}
OBJECTIVE: ${payload.objective}
PLATFORMS: ${payload.platforms.join(', ')}

PLATFORM TYPE GUIDE:
${buildPlatformGuide(payload.platforms)}

BUSINESS INFO:
${JSON.stringify(payload.businessInfo, null, 2)}

MARKETING STRATEGY:
${JSON.stringify(payload.strategy, null, 2)}

USER INPUTS:
${JSON.stringify(payload.inputs ?? {}, null, 2)}

ADDITIONAL INSTRUCTION:
${payload.instruction || 'No additional instruction.'}

STRICT RULES:
1) Return valid JSON only.
2) Use this exact root key: "generatedPosts".
3) Generate at least 2 posts per platform.
4) Every post must include: platform, type, caption.
5) Add hook, cta, suggestedVisual when useful.
6) hashtags must be an array of short strings (without # symbol).
7) ${modeHint}

JSON FORMAT:
{
  "generatedPosts": [
    {
      "platform": "Instagram",
      "type": "reel",
      "title": "Optional short title",
      "caption": "Post caption",
      "hashtags": ["marketing", "startup"],
      "hook": "Optional hook",
      "cta": "Optional CTA",
      "adCopyVariantA": "Optional ad version A",
      "adCopyVariantB": "Optional ad version B",
      "suggestedVisual": "Optional visual idea",
      "schedule": { "date": "2026-03-01", "time": "09:00" }
    }
  ]
}`;
}

export function buildRegeneratePlatformPrompt(payload: RegeneratePlatformPayload): string {
  const modeHint =
    payload.mode === ContentMode.ADS
      ? 'Focus on conversion and include ad copy variants when relevant.'
      : 'Focus on content marketing quality, education, and engagement.';

  return `You are a senior social media strategist.

Task: regenerate posts for one platform only.
Language: French only.

MODE: ${payload.mode}
OBJECTIVE: ${payload.objective}
TARGET PLATFORM: ${payload.platform}
${modeHint}

BUSINESS INFO:
${JSON.stringify(payload.businessInfo, null, 2)}

MARKETING STRATEGY:
${JSON.stringify(payload.strategy, null, 2)}

USER INPUTS:
${JSON.stringify(payload.inputs ?? {}, null, 2)}

CURRENT POSTS FOR THIS PLATFORM:
${JSON.stringify(payload.existingPlatformPosts ?? [], null, 2)}

ADDITIONAL INSTRUCTION:
${payload.instruction || 'No additional instruction.'}

STRICT RULES:
1) Return valid JSON only.
2) Use root key "generatedPosts".
3) Generate at least 2 improved posts for ${payload.platform}.
4) platform field must always be exactly "${payload.platform}".
5) Every post must include: platform, type, caption.

JSON FORMAT:
{
  "generatedPosts": [
    {
      "platform": "${payload.platform}",
      "type": "post",
      "caption": "Post caption",
      "hashtags": ["example"],
      "hook": "Optional hook",
      "cta": "Optional CTA",
      "adCopyVariantA": "Optional",
      "adCopyVariantB": "Optional",
      "suggestedVisual": "Optional visual idea",
      "schedule": { "date": "2026-03-02", "time": "10:00" }
    }
  ]
}`;
}

export function buildRegeneratePostPrompt(payload: RegeneratePostPayload): string {
  const modeHint =
    payload.mode === ContentMode.ADS
      ? 'Keep an ad mindset and optimize for conversion.'
      : 'Keep a content marketing mindset and optimize for engagement and trust.';

  return `You are a senior social media strategist.

Task: regenerate one post only.
Language: French only.

MODE: ${payload.mode}
OBJECTIVE: ${payload.objective}
PLATFORM: ${payload.platform}
${modeHint}

BUSINESS INFO:
${JSON.stringify(payload.businessInfo, null, 2)}

MARKETING STRATEGY:
${JSON.stringify(payload.strategy, null, 2)}

USER INPUTS:
${JSON.stringify(payload.inputs ?? {}, null, 2)}

CURRENT POST TO IMPROVE:
${JSON.stringify(payload.existingPost, null, 2)}

ADDITIONAL INSTRUCTION:
${payload.instruction || 'No additional instruction.'}

STRICT RULES:
1) Return valid JSON only.
2) Use root key "post".
3) Keep platform exactly "${payload.platform}".
4) Required fields: platform, type, caption.

JSON FORMAT:
{
  "post": {
    "platform": "${payload.platform}",
    "type": "post",
    "title": "Optional title",
    "caption": "Improved caption",
    "hashtags": ["example"],
    "hook": "Optional hook",
    "cta": "Optional CTA",
    "adCopyVariantA": "Optional",
    "adCopyVariantB": "Optional",
    "suggestedVisual": "Optional visual idea",
    "schedule": { "date": "2026-03-03", "time": "11:00" }
  }
}`;
}
