interface BusinessInfo {
  companyName?: string;
  industry?: string;
  targetAudience?: string;
  products?: string;
  objectives?: string;
  budget?: string;
  timeline?: string;
  currentPosition?: string;
  competitors?: string;
  uniqueValue?: string;
}

/**
 * Génère un prompt pour créer une stratégie marketing complète "One Page Marketing Plan"
 * structurée en Avant/Pendant/Après avec contenu concret et professionnel
 */
export function buildFullStrategyPrompt(businessInfo: BusinessInfo): string {
  const { 
    companyName = "l'entreprise", 
    industry = "le secteur d'activité", 
    targetAudience = "la clientèle cible", 
    products = "les produits/services",
    objectives = "les objectifs commerciaux",
    budget = "le budget disponible",
    timeline = "la période de mise en œuvre"
  } = businessInfo;

  return `En tant qu'expert en stratégie marketing, créez un "One Page Marketing Plan" complet et professionnel pour ${companyName} dans ${industry}.

INFORMATIONS CONTEXTUELLES :
- Entreprise : ${companyName}
- Secteur : ${industry}
- Audience cible : ${targetAudience}
- Produits/Services : ${products}
- Objectifs : ${objectives}
- Budget : ${budget}
- Période : ${timeline}

CONSIGNES STRICTES :
1. Répondez UNIQUEMENT avec un JSON valide, sans texte avant ou après
2. Structure obligatoire : Avant/Pendant/Après
3. Maximum 6 éléments concrets par section
4. Contenu 100% en français, professionnel et actionnable
5. Évitez les généralités, donnez des actions spécifiques

FORMAT JSON ATTENDU :
{
  "avant": {
    "marcheCible": {
      "persona": "Description détaillée du persona type de ${companyName} (âge, profession, besoins, comportements)",
      "besoins": ["Besoin principal 1", "Besoin principal 2", "Besoin principal 3"],
      "problemes": ["Problème majeur 1", "Problème majeur 2", "Problème majeur 3"],
      "comportementDigital": ["Habitude digitale 1", "Habitude digitale 2", "Habitude digitale 3"]
    },
    "messageMarketing": {
      "propositionValeur": "Proposition de valeur unique claire et attractive pour ${companyName}",
      "messagePrincipal": "Message marketing principal accrocheur et mémorable",
      "tonCommunication": "Ton de communication adapté (professionnel, amical, luxe, moderne, etc.)"
    },
    "canauxCommunication": {
      "plateformes": ["Plateforme 1", "Plateforme 2", "Plateforme 3"],
      "typesContenu": {
        "instagram": ["Type contenu Instagram 1", "Type contenu Instagram 2"],
        "tiktok": ["Type contenu TikTok 1", "Type contenu TikTok 2"],
        "linkedin": ["Type contenu LinkedIn 1", "Type contenu LinkedIn 2"],
        "facebook": ["Type contenu Facebook 1", "Type contenu Facebook 2"]
      }
    }
  },
  "pendant": {
    "captureProspects": {
      "landingPage": "Description détaillée de la landing page optimisée pour la conversion",
      "formulaire": "Description du formulaire de capture avec les champs optimaux",
      "offreIncitative": ["Lead magnet 1", "Lead magnet 2", "Lead magnet 3"]
    },
    "nurturing": {
      "sequenceEmails": ["Email 1: Sujet et contenu", "Email 2: Sujet et contenu", "Email 3: Sujet et contenu"],
      "contenusEducatifs": ["Contenu éducatif 1", "Contenu éducatif 2", "Contenu éducatif 3"],
      "relances": ["Relance 1", "Relance 2", "Relance 3"]
    },
    "conversion": {
      "cta": ["Call-to-action 1", "Call-to-action 2", "Call-to-action 3"],
      "offres": ["Offre de conversion 1", "Offre de conversion 2", "Offre de conversion 3"],
      "argumentaireVente": ["Argument de vente 1", "Argument de vente 2", "Argument de vente 3"]
    }
  },
  "apres": {
    "experienceClient": {
      "recommendations": ["Amélioration expérience 1", "Amélioration expérience 2", "Amélioration expérience 3"]
    },
    "augmentationValeurClient": {
      "upsell": ["Stratégie upsell 1", "Stratégie upsell 2", "Stratégie upsell 3"],
      "crossSell": ["Stratégie cross-sell 1", "Stratégie cross-sell 2", "Stratégie cross-sell 3"],
      "fidelite": ["Programme fidélité 1", "Programme fidélité 2", "Programme fidélité 3"]
    },
    "recommandation": {
      "parrainage": ["Système parrainage 1", "Système parrainage 2", "Système parrainage 3"],
      "avisClients": ["Stratégie avis 1", "Stratégie avis 2", "Stratégie avis 3"],
      "recompenses": ["Récompense 1", "Récompense 2", "Récompense 3"]
    }
  }
}

Générez maintenant ce plan marketing stratégique complet :`;
}

/**
 * Génère un prompt pour régénérer une section spécifique du plan marketing
 */
export function buildRegenerateSectionPrompt(
  businessInfo: BusinessInfo, 
  sectionKey: string, 
  instruction: string, 
  existingSection: any
): string {
  const { 
    companyName = "l'entreprise", 
    industry = "le secteur d'activité", 
    targetAudience = "la clientèle cible" 
  } = businessInfo;

  const sectionExamples = {
    'avant.marcheCible': `{
  "persona": "Description détaillée du persona (âge, profession, besoins, comportements)",
  "besoins": ["Besoin 1", "Besoin 2", "Besoin 3"],
  "problemes": ["Problème 1", "Problème 2", "Problème 3"],
  "comportementDigital": ["Habitude 1", "Habitude 2", "Habitude 3"]
}`,
    'avant.messageMarketing': `{
  "propositionValeur": "Proposition de valeur unique",
  "messagePrincipal": "Message marketing principal",
  "tonCommunication": "Ton de communication adapté"
}`,
    'avant.canauxCommunication': `{
  "plateformes": ["Plateforme 1", "Plateforme 2"],
  "typesContenu": {
    "instagram": ["Type 1", "Type 2"],
    "tiktok": ["Type 1", "Type 2"],
    "linkedin": ["Type 1", "Type 2"],
    "facebook": ["Type 1", "Type 2"]
  }
}`,
    'pendant.captureProspects': `{
  "landingPage": "Description de la landing page",
  "formulaire": "Description du formulaire",
  "offreIncitative": ["Lead magnet 1", "Lead magnet 2"]
}`,
    'pendant.nurturing': `{
  "sequenceEmails": ["Email 1", "Email 2", "Email 3"],
  "contenusEducatifs": ["Contenu 1", "Contenu 2"],
  "relances": ["Relance 1", "Relance 2"]
}`,
    'pendant.conversion': `{
  "cta": ["CTA 1", "CTA 2"],
  "offres": ["Offre 1", "Offre 2"],
  "argumentaireVente": ["Argument 1", "Argument 2"]
}`,
    'apres.experienceClient': `{
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}`,
    'apres.augmentationValeurClient': `{
  "upsell": ["Stratégie 1", "Stratégie 2"],
  "crossSell": ["Stratégie 1", "Stratégie 2"],
  "fidelite": ["Programme 1", "Programme 2"]
}`,
    'apres.recommandation': `{
  "parrainage": ["Système 1", "Système 2"],
  "avisClients": ["Stratégie 1", "Stratégie 2"],
  "recompenses": ["Récompense 1", "Récompense 2"]
}`
  };

  const formatExample = sectionExamples[sectionKey as keyof typeof sectionExamples] || `{
  // Structure adaptée à la section ${sectionKey}
}`;

  return `En tant qu'expert en stratégie marketing, régénérez complètement la section "${sectionKey}" du plan marketing pour ${companyName} dans ${industry}.

CONTEXTE ENTREPRISE :
- Entreprise : ${companyName}
- Secteur : ${industry}  
- Audience : ${targetAudience}

SECTION ACTUELLE À REMPLACER :
${JSON.stringify(existingSection, null, 2)}

INSTRUCTION SPÉCIFIQUE :
${instruction}

CONSIGNES STRICTES :
1. Répondez UNIQUEMENT avec un JSON valide de la section demandée
2. Respectez EXACTEMENT la structure attendue pour ${sectionKey}
3. Contenu 100% en français, concret et professionnel
4. Évitez de reproduire le contenu existant si demandé
5. Adaptez le contenu au secteur ${industry}

FORMAT JSON ATTENDU pour ${sectionKey} :
${formatExample}

Générez la nouvelle section maintenant :`;
}

/**
 * Génère un prompt pour améliorer une section existante sans changer sa logique principale
 */
export function buildImproveSectionPrompt(
  businessInfo: BusinessInfo,
  sectionKey: string, 
  instruction: string,
  existingSection: any
): string {
  const { 
    companyName = "l'entreprise", 
    industry = "le secteur d'activité", 
    targetAudience = "la clientèle cible" 
  } = businessInfo;

  const sectionExamples = {
    'avant.marcheCible': `{
  "persona": "Description détaillée du persona (âge, profession, besoins, comportements)",
  "besoins": ["Besoin 1", "Besoin 2", "Besoin 3"],
  "problemes": ["Problème 1", "Problème 2", "Problème 3"],
  "comportementDigital": ["Habitude 1", "Habitude 2", "Habitude 3"]
}`,
    'avant.messageMarketing': `{
  "propositionValeur": "Proposition de valeur unique",
  "messagePrincipal": "Message marketing principal",
  "tonCommunication": "Ton de communication adapté"
}`,
    'avant.canauxCommunication': `{
  "plateformes": ["Plateforme 1", "Plateforme 2"],
  "typesContenu": {
    "instagram": ["Type 1", "Type 2"],
    "tiktok": ["Type 1", "Type 2"],
    "linkedin": ["Type 1", "Type 2"],
    "facebook": ["Type 1", "Type 2"]
  }
}`,
    'pendant.captureProspects': `{
  "landingPage": "Description de la landing page",
  "formulaire": "Description du formulaire",
  "offreIncitative": ["Lead magnet 1", "Lead magnet 2"]
}`,
    'pendant.nurturing': `{
  "sequenceEmails": ["Email 1", "Email 2", "Email 3"],
  "contenusEducatifs": ["Contenu 1", "Contenu 2"],
  "relances": ["Relance 1", "Relance 2"]
}`,
    'pendant.conversion': `{
  "cta": ["CTA 1", "CTA 2"],
  "offres": ["Offre 1", "Offre 2"],
  "argumentaireVente": ["Argument 1", "Argument 2"]
}`,
    'apres.experienceClient': `{
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}`,
    'apres.augmentationValeurClient': `{
  "upsell": ["Stratégie 1", "Stratégie 2"],
  "crossSell": ["Stratégie 1", "Stratégie 2"],
  "fidelite": ["Programme 1", "Programme 2"]
}`,
    'apres.recommandation': `{
  "parrainage": ["Système 1", "Système 2"],
  "avisClients": ["Stratégie 1", "Stratégie 2"],
  "recompenses": ["Récompense 1", "Récompense 2"]
}`
  };

  const formatExample = sectionExamples[sectionKey as keyof typeof sectionExamples] || `{
  // Structure adaptée à la section ${sectionKey}
}`;

  return `En tant qu'expert en stratégie marketing, améliorez la section "${sectionKey}" du plan marketing pour ${companyName} dans ${industry}.

CONTEXTE ENTREPRISE :
- Entreprise : ${companyName}
- Secteur : ${industry}
- Audience : ${targetAudience}

SECTION ACTUELLE À AMÉLIORER :
${JSON.stringify(existingSection, null, 2)}

INSTRUCTION D'AMÉLIORATION :
${instruction}

CONSIGNES STRICTES :
1. Répondez UNIQUEMENT avec un JSON valide de la section améliorée
2. CONSERVEZ la logique et l'orientation générale
3. Respectez EXACTEMENT la structure attendue pour ${sectionKey}
4. Améliorez la précision, la clarté et l'impact
5. Contenu 100% en français, professionnel
6. Rendez le contenu plus spécifique et actionnable

FORMAT JSON ATTENDU pour ${sectionKey} améliorée :
${formatExample}

Générez la section améliorée maintenant :`;
}