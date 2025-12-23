FROM node:20-alpine
WORKDIR /app
COPY integration-service/package*.json ./
RUN npm install --production
COPY integration-service .
COPY shared ./shared
EXPOSE 3005
CMD ["node", "index.js"]
