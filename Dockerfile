FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# VITE_* so e' embutida no bundle em tempo de build, nao de runtime
ARG VITE_MS_ESTOQUE_URL=http://localhost:3002
ENV VITE_MS_ESTOQUE_URL=$VITE_MS_ESTOQUE_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
COPY --from=build /app/dist ./dist
EXPOSE 4002
CMD ["vite", "preview", "--port", "4002", "--host"]
