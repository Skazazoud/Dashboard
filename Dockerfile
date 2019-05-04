FROM node

WORKDIR /dashboard

COPY ./ ./

EXPOSE 8080

RUN npm install && npm run