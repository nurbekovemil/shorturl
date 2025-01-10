FROM node:22.12.0
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
