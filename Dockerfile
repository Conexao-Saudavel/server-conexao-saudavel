FROM node:20-alpine

WORKDIR /app

# Copia package.json e instala todas as dependências (incluindo dev) para o build
COPY package*.json ./
RUN npm install

# Copia o código fonte
COPY . .

# Compila o TypeScript e executa as migrações
RUN npm run build && \
    npm run migration:run:prod

# Remove dependências de desenvolvimento após o build
RUN npm prune --production

# Configura variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

# Expõe a porta
EXPOSE ${PORT:-3000}

# Comando para iniciar a aplicação
CMD ["npm", "start"] 