import { ScheduledService } from "./ScheduledService.js";
import env from "#config/env/env.js";
import knex from "#postgres/knex.js";
import log4js from "log4js";
import { google } from "googleapis";
import { formatDateLocal, formatDateTimeLocal } from "#utils/dateUtils.js";
import servicesConfig from "#config/services/services.config.js";

const logger = log4js.getLogger("PutGoogleTableService");

/**
 * Сервис для записи данных в Google таблицу
 * https://docs.google.com/spreadsheets/d/13Wg-tLmmLyPkLYGzopQESfhk6z41-vDfe6ST-uAQugk/edit?usp=sharing
 */
export class PutGoogleTableService extends ScheduledService {
    constructor() {
        super(); // Имя сервиса будет автоматически взято из имени класса
    }

    /**
     * Получить список ID таблиц
     * Сначала проверяет конфигурацию, если не задано - берет из базы данных
     * @returns Список ID таблиц
     */
    private async getSpreadsheetList(): Promise<string[]> {
        let spreadsheetIds: string[]=(servicesConfig.PutGoogleTableService?.spreadsheetIds||[]).map(id=>id.trim());

        const spreadsheets = await knex('spreadsheet').select('name')
        if (spreadsheets) spreadsheets.forEach(s=>spreadsheetIds.push(s.name))
        return spreadsheetIds;
    }
    /**
     * Инициализация клиента Google Sheets API
     * @returns Авторизованный клиент Google Sheets
     */
    getSheetsClient() {
        try {
            // Используем Service Account для аутентификации
            // Можно использовать GOOGLE_APPLICATION_CREDENTIALS (путь к JSON файлу)
            // Или GOOGLE_SERVICE_ACCOUNT_EMAIL и GOOGLE_PRIVATE_KEY через параметры GoogleAuth
            const authConfig: any = {
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            };

            // Если указаны email и private key, используем их напрямую
            if (env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY) {
                authConfig.credentials = {
                    client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Обработка экранированных символов новой строки
                };
            }

            const auth = new google.auth.GoogleAuth(authConfig);

            return google.sheets({ version: "v4", auth });
        } catch (error) {
            logger.error("Ошибка при инициализации Google Sheets клиента:", error);
            throw error;
        }
    }



    protected async execute(): Promise<void> {
        let sheetsClient = this.getSheetsClient();
        let spreadsheetList = await this.getSpreadsheetList();
        for (let spreadsheetId of spreadsheetList) {
            let spreadsheet = await sheetsClient.spreadsheets.get({
                spreadsheetId: spreadsheetId,
            });
            if (spreadsheet) {
                let spreadsheetName=spreadsheet.data?.properties?.title;
                const maxDateResult = await knex('tariff_box').max('date as maxDate').first();
                const maxDate = maxDateResult?.maxDate;
                if (maxDate) {
                    let sheetName = `stocks_coefs`;  // (${formatDateLocal(maxDate)})`;
                    let sheet = spreadsheet.data?.sheets?.find(sheet => sheet.properties?.title === sheetName);
                    if (!sheet) {
                        await sheetsClient.spreadsheets.batchUpdate({
                            spreadsheetId: spreadsheetId,
                            requestBody: {
                                requests: [{
                                    addSheet: {
                                        properties: {
                                            title: sheetName
                                        }
                                    }
                                }]
                            }
                        });
                        spreadsheet = await sheetsClient.spreadsheets.get({
                            spreadsheetId: spreadsheetId,
                        });
                        sheet = spreadsheet.data?.sheets?.find(sheet => sheet.properties?.title === sheetName);
                    }
                    if (sheet) {
                        const sheetId = sheet.properties?.sheetId;
                        const sheetName=sheet.properties?.title;
                        if (sheetId !== undefined) {
                            // Получаем данные из базы данных для конкретной даты
                            // Используем формат даты для корректного сравнения
                            const data = await knex('tariff_box')
                                .select(
                                    'geo.name as geo_name',
                                    'warehouse.name as warehouse_name',
                                    "boxDeliveryBase",
                                    "boxDeliveryCoefExpr",
                                    "boxDeliveryLiter",
                                    "boxDeliveryMarketplaceBase",
                                    "boxDeliveryMarketplaceCoefExpr",
                                    "boxDeliveryMarketplaceLiter",
                                    "boxStorageBase",
                                    "boxStorageCoefExpr",
                                    "boxStorageLiter"
                                )
                                .leftJoin('warehouse', 'tariff_box.warehouse_id', 'warehouse.id')
                                .leftJoin('geo', 'warehouse.geo_id', 'geo.id')
                                .where({'date': maxDate})
                                .orderBy('boxStorageCoefExpr', 'asc');
                            
                            if (data.length > 0) {
                                // Очищаем лист перед заполнением
                                await sheetsClient.spreadsheets.values.clear({
                                    spreadsheetId: spreadsheetId,
                                    range: `${sheetName}!A:Z`, // Очищаем колонки A-Z
                                });
                                
                                // Формируем заголовки
                                const headers = Object.keys(data[0]);
                                
                                // Преобразуем данные в формат для Google Sheets (массив массивов)
                                let d = new Date();
                                const values = [
                                    [`Обновлена ${formatDateTimeLocal(d)}`],
                                    headers, // Первая строка - заголовки
                                    ...data.map(row =>
                                        headers.map(header => {
                                            const value = row[header];
                                            // Обрабатываем null/undefined значения
                                            if (value === null || value === undefined) {
                                                return '';
                                            }
                                            // Если это Date объект, преобразуем в строку с учетом локального часового пояса
                                            if (value instanceof Date) {
                                                return formatDateLocal(value);
                                            }
                                            return String(value);
                                        })
                                    )
                                ];
                                
                                // Записываем данные в лист
                                await sheetsClient.spreadsheets.values.update({
                                    spreadsheetId: spreadsheetId,
                                    range: `${sheetName}!A1`,
                                    valueInputOption: 'RAW',
                                    requestBody: {
                                        values: values
                                    }
                                });
                            this.logger?.info(`Table ${spreadsheetName}(${spreadsheetId}) updated at ${formatDateTimeLocal(d)}`)        
                            }                                
                        }
                    }
                }
            }
            // let sheetName =
            // let sheet = spreadsheet.
        }
    }

}
  
