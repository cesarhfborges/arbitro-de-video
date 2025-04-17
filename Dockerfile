FROM node:18-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=768"

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . .

RUN npm run web:build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
