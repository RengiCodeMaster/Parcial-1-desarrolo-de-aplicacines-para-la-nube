# Multi-Stage Build Ligero para Backend Express Node.js
FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src/ ./src/

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
