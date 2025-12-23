FROM node:20

WORKDIR /app

COPY epcis-service/package*.json ./

RUN npm install

# Create uploads directory
RUN mkdir -p uploads

COPY epcis-service .

EXPOSE 3008

CMD ["npm", "start"]