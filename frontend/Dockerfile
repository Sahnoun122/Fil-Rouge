# Dockerfile pour le frontend Next.js
FROM node:18-alpine AS base

# Installer libc6-compat pour la compatibilité
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Etape de développement
FROM base AS development
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Etape de build
FROM base AS build
COPY . .

# Désactiver Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build l'application
RUN npm run build

# Etape de production
FROM node:18-alpine AS production
WORKDIR /app

# Désactiver Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Créer un groupe et utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copier les fichiers buildés depuis l'étape build
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Copier les fichiers Next.js buildés
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]