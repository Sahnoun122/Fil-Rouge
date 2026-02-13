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
    "title": "Préparation et Stratégie",
    "description": "Phase de préparation et d'analyse stratégique",
    "actions": [
      "Action précise 1 avec méthodologie claire",
      "Action précise 2 avec méthodologie claire",
      "Action précise 3 avec méthodologie claire",
      "Action précise 4 avec méthodologie claire",
      "Action précise 5 avec méthodologie claire",
      "Action précise 6 avec méthodologie claire"
    ]
  },
  "pendant": {
    "title": "Exécution et Déploiement",
    "description": "Phase d'exécution des tactiques marketing",
    "actions": [
      "Tactique d'exécution concrète 1",
      "Tactique d'exécution concrète 2",
      "Tactique d'exécution concrète 3",
      "Tactique d'exécution concrète 4",
      "Tactique d'exécution concrète 5",
      "Tactique d'exécution concrète 6"
    ]
  },
  "apres": {
    "title": "Mesure et Optimisation",
    "description": "Phase d'analyse des résultats et d'optimisation",
    "actions": [
      "Méthode de mesure et d'optimisation 1",
      "Méthode de mesure et d'optimisation 2",
      "Méthode de mesure et d'optimisation 3",
      "Méthode de mesure et d'optimisation 4",
      "Méthode de mesure et d'optimisation 5",
      "Méthode de mesure et d'optimisation 6"
    ]
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

  const sectionTitles = {
    avant: "Préparation et Stratégie",
    pendant: "Exécution et Déploiement", 
    apres: "Mesure et Optimisation"
  };

  const sectionTitle = sectionTitles[sectionKey as keyof typeof sectionTitles] || sectionKey;

  return `En tant qu'expert en stratégie marketing, régénérez complètement la section "${sectionTitle}" du plan marketing pour ${companyName} dans ${industry}.

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
2. Gardez la structure exacte : title, description, actions
3. Maximum 6 actions concrètes et professionnelles
4. Contenu 100% en français
5. Actions spécifiques au secteur et à l'entreprise
6. Évitez de reproduire les actions existantes si l'instruction demande du changement

FORMAT JSON ATTENDU (section "${sectionKey}") :
{
  "title": "Titre professionnel de la section",
  "description": "Description claire de cette phase", 
  "actions": [
    "Action concrète et spécifique 1",
    "Action concrète et spécifique 2", 
    "Action concrète et spécifique 3",
    "Action concrète et spécifique 4",
    "Action concrète et spécifique 5",
    "Action concrète et spécifique 6"
  ]
}

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

  const sectionTitles = {
    avant: "Préparation et Stratégie",
    pendant: "Exécution et Déploiement",
    apres: "Mesure et Optimisation"  
  };

  const sectionTitle = sectionTitles[sectionKey as keyof typeof sectionTitles] || sectionKey;

  return `En tant qu'expert en stratégie marketing, améliorez la section "${sectionTitle}" du plan marketing pour ${companyName} dans ${industry}.

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
2. CONSERVEZ la logique et l'orientation générale de la section existante
3. Améliorez la précision, la clarté et l'impact des actions
4. Gardez la même structure : title, description, actions
5. Maximum 6 actions affinées et optimisées
6. Contenu 100% en français, professionnel
7. Rendez les actions plus spécifiques et actionnables

FORMAT JSON ATTENDU (section "${sectionKey}" améliorée) :
{
  "title": "Titre optimisé de la section",
  "description": "Description améliorée et plus précise",
  "actions": [
    "Action améliorée et plus précise 1",
    "Action améliorée et plus précise 2",
    "Action améliorée et plus précise 3", 
    "Action améliorée et plus précise 4",
    "Action améliorée et plus précise 5",
    "Action améliorée et plus précise 6"
  ]
}

Générez la section améliorée maintenant :`;
}