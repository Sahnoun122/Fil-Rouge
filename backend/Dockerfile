# Dockerfile pour le backend NestJS
FROM node:18-alpine AS base

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./

# Installer les dépendances
RUN npm ci

# Etape de développement
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Etape de build  
FROM base AS build
COPY . .
RUN npm run build

# Etape de production
FROM node:18-alpine AS production
WORKDIR /app

# Copier package.json et installer seulement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier les fichiers buildés
COPY --from=build /app/dist ./dist

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Changer la propriété des fichiers
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]