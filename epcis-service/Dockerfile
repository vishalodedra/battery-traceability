FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

# Create uploads directory
RUN mkdir -p uploads

COPY index.js .

EXPOSE 3008

CMD ["npm", "start"]