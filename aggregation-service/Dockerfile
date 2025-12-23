FROM node:20-alpine
WORKDIR /app
COPY aggregation-service/package*.json ./
RUN npm install --production
COPY aggregation-service .
EXPOSE 3004
CMD ["node", "index.js"]
