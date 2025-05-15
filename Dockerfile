FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia o código fonte
COPY . .

# Configura variáveis de ambiente
ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

# Usa o script dev diretamente
CMD ["npm", "run", "dev"] 