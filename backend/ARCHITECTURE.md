# 🏗️ Architecture Modulaire Backend - Documentation

## 📁 Structure Finale du Projet

```
src/
├── auth/                          # Module d'authentification
│   ├── dto/
│   │   ├── login.dto.ts          # DTO pour la connexion
│   │   └── register.dto.ts       # DTO pour l'inscription
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     # Guard JWT avec gestion des routes publiques  
│   │   └── roles.guard.ts        # Guard pour la gestion des rôles
│   ├── auth.service.ts           # Service d'authentification complet
│   ├── auth.controller.ts        # Controller avec routes auth + décorateurs
│   ├── auth.module.ts            # Module d'authentification
│   ├── jwt.strategy.ts           # Strategy JWT Passport
│   └── local.strategy.ts         # Strategy Local Passport
│
├── users/                        # Module de gestion des utilisateurs
│   ├── entities/
│   │   └── user.entity.ts        # Entité User MongoDB (schéma complet)
│   ├── users.service.ts          # Service utilisateurs (CRUD + logique métier)
│   ├── users.controller.ts       # Controller utilisateurs (profil, équipe, admin)
│   └── users.module.ts           # Module utilisateurs
│
├── plans/                        # Module de gestion des plans
│   ├── entities/
│   │   └── plan.entity.ts        # Entité Plan avec fonctionnalités
│   ├── plans.service.ts          # Service Plans (prix, limites, comparaison)
│   ├── plans.controller.ts       # Controller Plans (API publique)
│   └── plans.module.ts           # Module plans
│
├── app.module.ts                 # Module principal (imports + guards globaux)
└── main.ts                       # Point d'entrée de l'application
```

## ✨ Fonctionnalités Implémentées

### 🔐 Module Auth (`/auth`)
- ✅ **Inscription** : `POST /auth/register` avec validation complète
- ✅ **Connexion** : `POST /auth/login` + `POST /auth/login-passport` 
- ✅ **JWT Tokens** : Access token (15min) + Refresh token (7j)
- ✅ **Refresh Token** : `POST /auth/refresh-token`
- ✅ **Déconnexion** : `POST /auth/logout`
- ✅ **Profil utilisateur** : `GET /auth/me`
- ✅ **Permissions** : `GET /auth/permissions`
- ✅ **Routes protégées** : Guards JWT + Rôles

### 👤 Module Users (`/users`)
- ✅ **Gestion profil** : `GET/PUT /users/profile`
- ✅ **Changement mot de passe** : `PUT /users/password`
- ✅ **Gestion équipe** : `POST/PUT/DELETE /users/team/members`
- ✅ **Plans abonnement** : `PUT /users/plan`
- ✅ **Administration** : `GET/PUT /users/admin/*` (admin seulement)
- ✅ **Statistiques** : `GET /users/admin/stats`

### 💳 Module Plans (`/plans`)  
- ✅ **Plans disponibles** : `GET /plans`
- ✅ **Informations prix** : `GET /plans/pricing`
- ✅ **Comparaison plans** : `GET /plans/compare`
- ✅ **Détails plan** : `GET /plans/:type`
- ✅ **Fonctionnalités** : `GET /plans/:type/features`

## 🛡️ Sécurité & Guards

### Guards Implémentés
- **JwtAuthGuard** : Protection JWT avec routes publiques (`@Public()`)
- **RolesGuard** : Protection par rôle (`@Roles('admin', 'user')`)
- **Guards Globaux** : JwtAuthGuard appliqué automatiquement

### Décorateurs Personnalisés
```typescript
@Public()                    // Route publique (pas d'auth)
@Roles('admin')             // Admin seulement
@Roles('admin', 'user')     // Admin ou User
```

### Strategies Passport
- **JWT Strategy** : Validation des tokens JWT
- **Local Strategy** : Authentification email/password

## 📊 Schéma User Complet 

### Informations Utilisateur
```typescript
{
  // Profil
  fullName: string
  email: string
  password: string (hashed)
  phone: string
  companyName: string
  industry: string
  
  // Auth & Rôle  
  role: 'admin' | 'user'
  refreshToken?: string (hashed)
  lastLoginAt?: Date
  
  // Abonnement
  plan: 'free' | 'pro' | 'business'
  subscriptionStatus: 'active' | 'expired' | 'canceled'
  subscriptionStartDate: Date
  subscriptionEndDate?: Date
  
  // Limites par plan
  limits: {
    maxStrategiesPerMonth: number
    maxPublicationsPerMonth: number
    maxSwotPerMonth: number
    maxPdfExportsPerMonth: number
  }
  
  // Équipe
  team: {
    maxMembers: number
    members: [{
      userId: ObjectId
      role: 'editor' | 'viewer' | 'manager'
      addedAt: Date
    }]
  }
  
  // Sécurité
  isActive: boolean
  isBanned: boolean
}
```

## 💳 Plans & Limites

### Plan Free
```json
{
  "maxStrategiesPerMonth": 3,
  "maxPublicationsPerMonth": 10, 
  "maxSwotPerMonth": 3,
  "maxPdfExportsPerMonth": 3,
  "maxTeamMembers": 1,
  "monthlyPrice": 0
}
```

### Plan Pro  
```json
{
  "maxStrategiesPerMonth": 25,
  "maxPublicationsPerMonth": 100,
  "maxSwotPerMonth": 25, 
  "maxPdfExportsPerMonth": 25,
  "maxTeamMembers": 5,
  "monthlyPrice": 29.99,
  "prioritySupport": true,
  "advancedAnalytics": true
}
```

### Plan Business
```json
{
  "maxStrategiesPerMonth": -1,
  "maxPublicationsPerMonth": -1,
  "maxSwotPerMonth": -1,
  "maxPdfExportsPerMonth": -1,
  "maxTeamMembers": 50,
  "monthlyPrice": 99.99,
  "prioritySupport": true,
  "customBranding": true,
  "apiAccess": true,
  "unlimitedExports": true
}
```

## 🚀 Utilisation

### 1. Configuration Environment
```bash
# Copier et configurer
cp .env.example .env

# Variables critiques :
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
MONGODB_URI=mongodb://localhost:27017/marketplan-ia
```

### 2. Démarrage Application
```bash
# Installation
npm install

# Développement
npm run start:dev

# Production
npm run build && npm run start:prod
```

### 3. Test des APIs

#### Inscription
```bash
POST /auth/register
{
  "fullName": "Jean Dupont",
  "email": "jean@example.com", 
  "password": "SecurePass123!",
  "phone": "+33123456789",
  "companyName": "Ma Société",
  "industry": "Technology"
}
```

#### Connexion
```bash
POST /auth/login
{
  "email": "jean@example.com",
  "password": "SecurePass123!"
}
```

#### Routes Protégées
```bash
GET /auth/me
Authorization: Bearer {access-token}

GET /users/profile  
Authorization: Bearer {access-token}

GET /users/admin/all
Authorization: Bearer {admin-access-token}
```

## 🔧 Points d'Extension

### Ajouter de Nouveaux Modules
1. Créer dossier dans `/src`
2. Créer entité, service, controller, module
3. Importer dans `app.module.ts`

### Nouveaux Guards
1. Créer guard dans `/src/auth/guards`
2. Exporter depuis `auth.module.ts`
3. Utiliser avec `@UseGuards()`

### Nouvelles Validations
1. Créer DTOs dans module concerné
2. Utiliser `class-validator` 
3. Appliquer avec `@Body(ValidationPipe)`

## 📈 Architecture Évolutive

Cette architecture modulaire permet :
- ✅ **Séparation des responsabilités** claire
- ✅ **Réutilisabilité** des composants
- ✅ **Tests unitaires** facilités  
- ✅ **Maintenance** simplifiée
- ✅ **Scalabilité** horizontale
- ✅ **Sécurité** renforcée

## 🎯 Prochaines Étapes

1. **Tests** : Ajouter tests unitaires et e2e
2. **Validation** : Tester toutes les routes API
3. **Documentation** : Compléter la doc Swagger/OpenAPI
4. **Monitoring** : Ajouter logs et métriques
5. **Déploiement** : Configurer CI/CD

---

🚀 **Votre architecture d'authentification modulaire est prête pour la production !**