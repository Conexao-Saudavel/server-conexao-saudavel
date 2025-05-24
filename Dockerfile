# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código fonte
COPY . .

# Compila o TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copia apenas os arquivos necessários do stage de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Configura variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

# Expõe a porta
EXPOSE ${PORT:-3000}

# Comando para iniciar a aplicação
CMD ["npm", "start"] 