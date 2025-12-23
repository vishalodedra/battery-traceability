FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY shared ./shared
COPY index.js .
EXPOSE 3005
CMD ["node", "index.js"]
