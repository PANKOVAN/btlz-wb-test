# ТЕСТОВОЕ ЗАДАНИЕ


Тестовое задание выполнено.

## Описание.

После настройки и запуска приложение автоматически создает базу данных, если еще нет и выполняет миграцию до последней версии. После этого регистрируются и запускаются по расписанию два сервиса:

- первый обращается через WB API к сервису Wildberries, получает данные (“Тарифы коробов”) и записывает в базу по дням. В течении дня происходит обновление данных. Сохраняются все полученные данные.

- второй выбирает из данные из таблицы для последней даты и формирую страницу stock_coefs. Данные отсортированы по store_coef.
Список id таблиц можно задать в настройках. Кроме этого можно добавлять и удалять id таблиц, через специальный интерфейс. Сами таблицы должны быть созданы заранее, с правами на правку всем у кого есть ссылка.

Сейчас сервисы обновляются каждую минуту, чтобы сразу видеть результат. Можно перестроить на 1 час как в ТЗ. Для настройки переодического запуска используется нотация cron. Каждый сервис может иметь свое расписание.

Структура базы, самая обычная. 
```js
knex.schema
        .createTable("geo", (table) => {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.unique("name");
        })
        .createTable("warehouse", (table) => {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.integer("geo_id").references("id").inTable("geo").index('geo_id');
            table.unique(["name", "geo_id"]);
        })
        .createTable("tariff_box", (table) => {
            table.increments("id").primary();
            table.date("date").notNullable().index('date');
            table.float("boxDeliveryBase").nullable();
            table.float("boxDeliveryCoefExpr").nullable();
            table.float("boxDeliveryLiter").nullable();
            table.float("boxDeliveryMarketplaceBase").nullable();
            table.float("boxDeliveryMarketplaceCoefExpr").nullable();
            table.float("boxDeliveryMarketplaceLiter").nullable();
            table.float("boxStorageBase").nullable();
            table.float("boxStorageCoefExpr").nullable();
            table.float("boxStorageLiter").nullable();
            table.integer("warehouse_id").references("id").inTable("warehouse").index('warehouse_id');
            table.unique(["date", "warehouse_id"]);
        })
        .createTable("spreadsheet", (table) => {
            table.increments("id").primary();
            table.string("name").notNullable();
            table.unique("name");
        })
```



## Настройка

Все критические настройки задаются в файле .env. Файл example.env содержит шаблон настроек.

```
# Environment settings
NODE_ENV=production

# PostgreSQL settings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=postgress
POSTGRES_USER=postgres
POSTGRES_PASSWORD=posgress

# Application settings
APP_PORT=5000

# WB settings
WB_API_KEY="YOU WB KEY"

# GOOGLE
GOOGLE_SERVICE_ACCOUNT_EMAIL="YOU GOOGLE ACCOUNT EMAIL"
GOOGLE_PRIVATE_KEY="YOU GOOGLE PRIVATE KEY"

# SHEETS LIST (OPTIONAL)
# GOOGLE_SPREADSHEET_IDS="YOU GOOGLE SPREAD SHEETS ID"
```
Надо задать

- WB_API_KEY="YOU WB KEY"
- GOOGLE_SERVICE_ACCOUNT_EMAIL="YOU GOOGLE ACCOUNT EMAIL"
- GOOGLE_PRIVATE_KEY="YOU GOOGLE PRIVATE KEY"

Можно добавить GOOGLE_SPREADSHEET_IDS - список id таблиц Google через запятую. 

## Запуск и управление
Для запуска службы и postgres используйте

```bash
docker compose up -d --build 
```

Для остановки используйте

```bash
docker compose down 
```

Добавление нового id в список таблиц.

```bash
docker compose down 
```


Проверка работы сервиса
```bash
curl "http://localhost:5000/"
```

Получение spreadsheet ID
```bash
curl "http://localhost:5000/api/spreadsheets"
```

Добавление нового spreadsheet ID
```bash
curl -X PUT "http://localhost:5000/api/spreadsheets?spreadsheetId=YOU_ID"
```

Удаление spreadsheet ID
```bash
curl -X DELETE "http://localhost:5000/api/spreadsheets/YOU_ID"
```

Очистка всей таблицы
```bash
curl -X DELETE "http://localhost:5000/api/spreadsheets"
```

Кроме этого доступны все команды перечисленные в шаблоне.

