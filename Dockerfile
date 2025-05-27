FROM node:20-alpine

WORKDIR /app

# Configurações básicas
ENV NODE_ENV=development
ENV PORT=${PORT:-3000}

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código fonte
COPY . .

# Compila o TypeScript
RUN npm run build

EXPOSE ${PORT:-3000}

# Usa o script dev para desenvolvimento
CMD ["npm", "run", "dev"] 