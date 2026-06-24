FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# Vazio por padrao = caminho relativo, que passa pelo proxy configurado no
# vite.config.ts (server/preview.proxy) em vez de bater direto no MS (sem CORS).
# VITE_* so e' embutida no bundle em tempo de build, nao de runtime.
ARG VITE_MS_ESTOQUE_URL=
ENV VITE_MS_ESTOQUE_URL=$VITE_MS_ESTOQUE_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
# host.docker.internal alcanca a porta publicada no host (Docker Desktop/OrbStack).
# Em docker-compose, sobrescreva com o nome do servico, ex.: http://plus-ms-estoque:3000
ENV MS_ESTOQUE_PROXY_TARGET=http://host.docker.internal:3000
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/dist ./dist
EXPOSE 4002
CMD ["npm", "run", "preview"]
