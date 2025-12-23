FROM node:20-alpine
WORKDIR /app
COPY serialization-service/package*.json ./
RUN npm install --production
COPY shared ./shared
COPY serialization-service .
EXPOSE 3001
CMD ["node", "index.js"]
