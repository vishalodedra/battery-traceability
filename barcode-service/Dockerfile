FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY shared ./shared
COPY index.js .
RUN mkdir -p /app/images
VOLUME /app/images
EXPOSE 3002
CMD ["node", "index.js"]
