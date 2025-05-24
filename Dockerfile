FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install --omit=dev --no-package-lock

# Copia o código fonte
COPY . .

# Compila o TypeScript
RUN npm run build

# Configura variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

EXPOSE ${PORT:-3000}

# Usa o script start para produção
CMD ["npm", "start"] 