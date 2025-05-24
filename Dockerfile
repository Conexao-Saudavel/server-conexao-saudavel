FROM node:20-alpine

WORKDIR /app

# Instala dependências de build
COPY package*.json ./
RUN npm install

# Copia o código fonte
COPY . .

# Configura variáveis de ambiente para produção
ENV NODE_ENV=production

# Compila o TypeScript
RUN npm run build

# Remove dependências de desenvolvimento
RUN npm prune --production

# Configura variáveis de ambiente
ENV PORT=${PORT:-3000}

# Expõe a porta
EXPOSE ${PORT:-3000}

# Comando para iniciar a aplicação
CMD ["npm", "start"] 