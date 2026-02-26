// Подавляем предупреждения о deprecated модулях (например, punycode)
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
        // Игнорируем предупреждения о punycode
        return;
    }
    // Выводим остальные предупреждения
    console.warn(warning.name, warning.message);
});

import { migrate, seed } from "#postgres/knex.js";
import { Scheduler } from "#services/index.js";
import { GetWBTariffService, PutGoogleTableService } from "#services/index.js";
import servicesConfig from "#config/services/services.config.js";
import log4js from "log4js";
import env from "#config/env/env.js";
import http from "http";
import { URL } from "url";
import knex from "#postgres/knex.js";
import { createHelper } from "#postgres/createHelper.js";

// Настройка логгера
log4js.configure({
    appenders: {
        console: { type: "console" },
    },
    categories: {
        default: { appenders: ["console"], level: "info" },
    },
});

const logger = log4js.getLogger("App");

/**
 * Обработчик маршрутов для управления Google Spreadsheet ID
 */
async function handleSpreadsheetRoutes(req: http.IncomingMessage, res: http.ServerResponse, pathname: string) {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathParts = pathname.split('/').filter(p => p);
    
    // GET /api/spreadsheets - получить список всех spreadsheet ID
    if (req.method === 'GET' && pathParts.length === 2) {
        try {
            const spreadsheets = await knex('spreadsheet')
                .select('id', 'name')
                .orderBy('id', 'asc');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true,
                data: spreadsheets 
            }));
        } catch (error: any) {
            logger.error('Error fetching spreadsheets:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                error: error.message 
            }));
        }
        return;
    }

    // PUT /api/spreadsheets?spreadsheetId=xxx - добавить новый spreadsheet ID
    if (req.method === 'PUT' && pathParts.length === 2) {
        try {
            const spreadsheetId = url.searchParams.get('spreadsheetId') || url.searchParams.get('name');

            if (!spreadsheetId || spreadsheetId.trim().length === 0) {
                logger.warn('PUT /api/spreadsheets - Missing spreadsheetId parameter');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false,
                    error: 'spreadsheetId query parameter is required' 
                }));
                return;
            }

            // Добавляем spreadsheet ID в базу данных
            try {
                const [inserted] = await knex('spreadsheet')
                    .insert({ name: spreadsheetId.trim() })
                    .onConflict('name')
                    .ignore()
                    .returning(['id', 'name']);

                if (inserted) {
                    logger.info(`Added spreadsheet ID: ${spreadsheetId}`);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true,
                        message: 'Spreadsheet ID added successfully',
                        data: inserted 
                    }));
                } else {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false,
                        error: 'Spreadsheet ID already exists' 
                    }));
                }
            } catch (dbError: any) {
                logger.error('Database error:', dbError);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false,
                    error: 'Database error',
                    details: dbError.message
                }));
            }
        } catch (error: any) {
            logger.error('Error adding spreadsheet:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                error: error.message 
            }));
        }
        return;
    }

    // DELETE /api/spreadsheets - очистить всю таблицу spreadsheet
    if (req.method === 'DELETE' && pathParts.length === 2) {
        try {
            const deletedCount = await knex('spreadsheet').delete();
            
            logger.info(`Cleared all spreadsheets. Deleted ${deletedCount} records`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true,
                message: `All spreadsheets cleared successfully`,
                deletedCount: deletedCount
            }));
        } catch (error: any) {
            logger.error('Error clearing spreadsheets:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                error: error.message 
            }));
        }
        return;
    }

    // DELETE /api/spreadsheets/:id - удалить spreadsheet ID по ID записи или по name
    if (req.method === 'DELETE' && pathParts.length === 3) {
        try {
            const identifier = pathParts[2]; // ID записи или spreadsheet ID (name)
            
            // Пытаемся удалить по ID записи (число)
            const idNum = parseInt(identifier);
            let deletedCount = 0;

            if (!isNaN(idNum)) {
                // Удаление по ID записи
                deletedCount = await knex('spreadsheet')
                    .where({ id: idNum })
                    .delete();
            } else {
                // Удаление по name (spreadsheet ID)
                deletedCount = await knex('spreadsheet')
                    .where({ name: identifier })
                    .delete();
            }

            if (deletedCount > 0) {
                logger.info(`Deleted spreadsheet: ${identifier}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true,
                    message: 'Spreadsheet ID deleted successfully' 
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false,
                    error: 'Spreadsheet ID not found' 
                }));
            }
        } catch (error: any) {
            logger.error('Error deleting spreadsheet:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false,
                error: error.message 
            }));
        }
        return;
    }

    // Неизвестный маршрут
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        success: false,
        error: 'Route not found' 
    }));
}

async function main() {
    try {

        //Запуск миграций и сидов
        await createHelper();
        await migrate.latest();
        await seed.run();

        // Инициализация планировщика
        const scheduler = new Scheduler();

        // Регистрация сервисов с расписанием на основе конфигурации
        if (servicesConfig.GetWBTariffService.enabled)      scheduler.register(new GetWBTariffService());
        if (servicesConfig.PutGoogleTableService.enabled)   scheduler.register(new PutGoogleTableService());

        // Запуск всех зарегистрированных сервисов с расписанием
        scheduler.startAll();

        // Запуск HTTP сервера для прослушивания порта
        let server: http.Server | undefined;
        if (env.APP_PORT) {
            server = http.createServer(async (req, res) => {
                // Устанавливаем CORS заголовки
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                // Обработка OPTIONS запроса для CORS
                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }

                try {
                    const url = new URL(req.url || '/', `http://${req.headers.host}`);
                    const pathname = url.pathname;

                    // Роутинг для API endpoints
                    if (pathname.startsWith('/api/spreadsheets')) {
                        await handleSpreadsheetRoutes(req, res, pathname);
                    } else {
                        // Health check endpoint
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            status: 'ok', 
                            message: 'Service is running',
                            timestamp: new Date().toISOString()
                        }));
                    }
                } catch (error: any) {
                    logger.error('Error handling request:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        error: 'Internal server error',
                        message: error.message 
                    }));
                }
            });

            server.listen(env.APP_PORT, () => {
                logger.info(`HTTP server listening on port ${env.APP_PORT}`);
            });

            // Обработка ошибок сервера
            server.on('error', (error: NodeJS.ErrnoException) => {
                if (error.code === 'EADDRINUSE') {
                    logger.error(`Port ${env.APP_PORT} is already in use`);
                } else {
                    logger.error('Server error:', error);
                }
                process.exit(1);
            });
        } else {
            logger.info("APP_PORT not configured, HTTP server will not be started");
        }

        // Обработка сигналов для корректного завершения работы
        const gracefulShutdown = (signal: string) => {
            logger.info(`Получен ${signal}, корректное завершение работы...`);
            
            // Останавливаем сервисы
            scheduler.stopAll();
            
            // Закрываем HTTP сервер, если он запущен
            if (server) {
                server.close(() => {
                    logger.info("HTTP server closed");
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        };

        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    } catch (error) {
        logger.error("Не удалось запустить приложение:", error);
        process.exit(1);
    }
}

await main();