FROM arm32v7/node:8-slim

WORKDIR /app/

COPY package*.json ./

RUN npm install --production

COPY . .

USER root

EXPOSE 8090

CMD ["node", "app.js"]
