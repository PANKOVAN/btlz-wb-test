# your node version
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY ./package*.json .

RUN npm install --omit=dev

FROM deps-prod AS build

RUN npm install --include=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

# Устанавливаем wget для healthcheck и tzdata для настройки часового пояса
RUN apk add --no-cache wget tzdata

# Устанавливаем московское время по умолчанию
ENV TZ=Europe/Moscow

WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Указываем порт (опционально, для документации)
EXPOSE 5000

# Запускаем приложение
CMD [ "npm", "run", "start" ]