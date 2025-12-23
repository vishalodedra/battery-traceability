FROM node:20-alpine
WORKDIR /app
COPY barcode-service/package*.json ./
RUN npm install --production
COPY barcode-service .
COPY shared ./shared
RUN mkdir -p /app/images
VOLUME /app/images
EXPOSE 3002
CMD ["node", "index.js"]
