FROM node:20

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia arquivos
COPY . .

# Instala dependências
RUN pnpm install

# Build do projeto
RUN pnpm build

# Expondo porta padrão do Nuxt
EXPOSE 3000

# Start
CMD ["node", ".output/server/index.mjs"]
