FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY ./server ./server
COPY ./src ./src

ENV NODE_ENV=production

CMD ["node", "server/equityTracker.js"]
