import knex from "knex";
import env from "#config/env/env.js";
import log4js from "log4js";

const logger = log4js.getLogger("CreateDatabase");

/**
 * Создает базу данных, если она не существует
 * Использует knex.js для подключения к системной БД postgres
 */
export async function createHelper(): Promise<void> {
    const dbName = env.POSTGRES_DB;
    const host = env.POSTGRES_HOST ?? "localhost";
    const port = env.POSTGRES_PORT ?? 5432;
    const user = env.POSTGRES_USER;
    const password = env.POSTGRES_PASSWORD;

    // Подключаемся к системной БД postgres для проверки/создания БД
    const systemKnex = knex({
        client: "pg",
        connection: {
            host,
            port,
            user,
            password,
            database: "postgres", // Подключаемся к системной БД
        },
    });

    try {
        logger.info(`Подключение к PostgreSQL установлено (${host}:${port})`);

        // Проверяем, существует ли база данных
        const result = await systemKnex.raw(
            "SELECT 1 FROM pg_database WHERE datname = ?",
            [dbName]
        );

        if (result.rows.length === 0) {
            // База данных не существует, создаем её
            // Для CREATE DATABASE используем экранирование через knex.raw
            // В PostgreSQL имена БД экранируются двойными кавычками
            logger.info(`Создание базы данных: ${dbName}`);
            // Используем ?? для экранирования идентификатора в knex
            await systemKnex.raw(`CREATE DATABASE ??`, [dbName]);
            logger.info(`База данных "${dbName}" успешно создана`);
        } else {
            logger.info(`База данных "${dbName}" уже существует`);
        }
    } catch (error) {
        logger.error(`Ошибка при создании базы данных:`, error);
        throw error;
    } finally {
        await systemKnex.destroy();
    }
}
