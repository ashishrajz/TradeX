FROM node:18-alpine
WORKDIR /app

# Copy only needed parts
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY ./server ./server
COPY ./src ./src

ENV NODE_ENV=production

CMD ["node", "server/liveWorker.js"]
