# MarketPlan IA - Générateur de Stratégie Marketing Hybride

Une application SaaS moderne construite avec Next.js 14 et Tailwind CSS qui génère des stratégies marketing complètes personnalisées grâce à l'intelligence artificielle.

## 🚀 Fonctionnalités

### ✨ Génération de Stratégie IA
- Formulaire intelligent qui collecte les informations business
- Génération automatique d'un "One Page Marketing Plan" complet
- Animation de progression avec étapes détaillées
- Stratégie structurée en 3 phases : **AVANT** (Prospect) → **PENDANT** (Lead) → **APRÈS** (Client)

### 📊 Dashboard Interactif
- Vue d'ensemble avec cartes de résumé (secteur, objectif, ton, budget)
- Navigation par onglets entre les 3 phases de la stratégie
- Visualisation claire de chaque section avec icônes et couleurs

### 🛠️ Outils d'Amélioration
- **Édition manuelle** de chaque section
- **Régénération IA** avec instructions personnalisées
- **Amélioration IA** du contenu existant
- Modal interactif pour donner des instructions précises à l'IA

### 💾 Gestion des Données
- Sauvegarde automatique en localStorage
- Export de stratégie en format JSON
- Partage via API native ou copie de lien
- Historique des modifications

## 🏃 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) pour voir l'application.

**Pages principales :**
- `/strategies/create` - Créer une nouvelle stratégie
- `/strategies/[id]` - Voir une stratégie existante

## 📁 Structure du Projet

```
frontend/src/
├── app/
│   └── strategies/
│       ├── create/
│       │   └── page.tsx          # Page de création de stratégie
│       └── [id]/
│           └── page.tsx          # Page d'affichage de stratégie
├── components/
│   ├── strategy/
│   │   ├── StrategyForm.tsx      # Formulaire de création
│   │   ├── StrategyTabs.tsx      # Navigation par onglets
│   │   ├── SectionCard.tsx       # Card pour chaque section
│   │   ├── RegenerateModal.tsx   # Modal de régénération IA
│   │   └── LoadingSkeleton.tsx   # États de chargement
│   └── ui/
│       └── Toast.tsx             # Système de notifications
└── types/
    └── strategy.ts               # Types TypeScript
```

## 🎨 Design System

### Couleurs
- **Primary**: Violet (#8B5CF6) to Purple (#A855F7)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)
- **Neutral**: Gray palette

### Composants
- **Cards**: `rounded-2xl` avec soft shadows
- **Buttons**: Gradients violet/purple avec hover effects
- **Icons**: Lucide React pour cohérence
- **Layout**: Responsive grid avec breakpoints Tailwind

## 🔧 Technologies Utilisées

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **State Management**: React hooks + Context (Toast)
- **Storage**: localStorage (démo) / API ready

## 🚦 Pages Principales

### `/strategies/create`
Page de création avec :
- Formulaire complet (8 champs)
- Validation en temps réel
- États de chargement animés
- Progression step-by-step
- Redirection automatique vers résultat

### `/strategies/[id]`
Dashboard de stratégie avec :
- Header avec actions (partage, export, retour)
- Cartes de résumé business
- Navigation 3 phases (Avant/Pendant/Après)
- Sections interactives avec boutons d'action
- Modal de régénération/amélioration

## 📋 Sections de Stratégie

### Phase AVANT (Prospects)
1. **Marché Cible** - Persona, besoins, problèmes, comportement digital
2. **Message Marketing** - Proposition de valeur, message principal, ton
3. **Canaux de Communication** - Plateformes et types de contenu

### Phase PENDANT (Leads)
1. **Capture Prospects** - Landing page, formulaires, offres incitatives
2. **Nurturing** - Séquences d'emails, contenus éducatifs, relances
3. **Conversion** - CTAs, offres commerciales, argumentaires

### Phase APRÈS (Clients)
1. **Expérience Client** - Recommandations d'amélioration
2. **Augmentation Valeur Client** - Upsell, cross-sell, fidélité
3. **Recommandation** - Parrainage, avis clients, récompenses

## 🎯 Utilisation

1. **Créer une stratégie** → Aller sur `/strategies/create` → Remplir le formulaire → Générer
2. **Consulter une stratégie** → Accéder via `/strategies/[id]` → Explorer les 3 phases
3. **Améliorer une section** → Cliquer "Régénérer/Améliorer" → Donner instructions → Confirmer

## 🚀 Prochaines Étapes Production

1. **Backend API** pour génération IA réelle
2. **Base de données** pour persistance
3. **Authentification** utilisateur
4. **Export PDF** formaté
5. **Intégrations** CRM/Marketing tools

---

**MarketPlan IA** - Transformez votre approche marketing avec l'intelligence artificielle 🚀
