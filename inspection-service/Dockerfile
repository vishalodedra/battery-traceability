FROM node:20-alpine
WORKDIR /app
COPY inspection-service/package*.json ./
RUN npm install --production
COPY inspection-service .
COPY shared ./shared
EXPOSE 3003
CMD ["node", "index.js"]
