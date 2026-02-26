import { z } from "zod";
import env from "#config/env/env.js";

/**
 * Схема конфигурации для отдельного сервиса
 */
const serviceConfigSchema = z.object({
    /**
     * Cron выражение для расписания запуска
     * Примеры:
     * - "0 0 * * *" - Каждый день в полночь
     * - "0 *\/6 * * *" - Каждые 6 часов
     * - "*\/5 * * * *" - Каждые 5 минут
     * - "0 9 * * 1-5" - Каждый будний день в 9 утра
     */
    cronExpression: z.string().default("*/1 * * * *"), // Каждую минуту
    /**
     * Включен ли сервис (если false, сервис не будет запущен)
     */
    enabled: z.boolean().default(true),
    /**
     * Часовой пояс для выполнения задачи
     */
    timezone: z.string().optional().default("UTC"),
});

/**
 * Расширенная схема конфигурации для PutGoogleTableService
 */
const putGoogleTableServiceConfigSchema = serviceConfigSchema.extend({
    /**
     * Список ID Google Spreadsheets для обработки
     * Если не указан, список будет получен из базы данных
     */
    spreadsheetIds: z.array(z.string()).optional(),
});

/**
 * Схема конфигурации для всех сервисов
 */
const servicesConfigSchema = z.object({
    /**
     * Общие настройки для всех сервисов
     */
    global: z
        .object({
            /**
             * Часовой пояс по умолчанию
             */
            timezone: z.string().default("UTC"),
        })
        .default({ timezone: "UTC" }),
    /**
     * Конфигурация для сервиса GetWBTariffService
     */
    GetWBTariffService: serviceConfigSchema,
    /**
     * Конфигурация для сервиса PutGoogleTableService
     */
    PutGoogleTableService: putGoogleTableServiceConfigSchema,
});

export type ServiceConfig = z.infer<typeof serviceConfigSchema>;
export type ServicesConfig = z.infer<typeof servicesConfigSchema>;

/**
 * Конфигурация сервисов
 * Можно расширить для чтения из переменных окружения или файла конфигурации
 */
const servicesConfig: ServicesConfig = {
    global: {
        timezone: "UTC",
    },
    GetWBTariffService: {
        cronExpression: "*/1 * * * *", // Каждую минуту
        enabled: true,
        timezone: "UTC",
    },
    PutGoogleTableService: {
        cronExpression: "*/1 * * * *", // Каждую минуту
        enabled: true,
        timezone: "UTC",
        spreadsheetIds: (env.GOOGLE_SPREADSHEET_IDS||'').split(',').map(id => id.trim()).filter(id => id.length > 0)
    },
};

/**
 * Валидация и экспорт конфигурации
 */
const validatedConfig = servicesConfigSchema.parse(servicesConfig);

/**
 * Получить конфигурацию сервиса по его имени
 * @param serviceName - Имя сервиса (ключ в конфигурации, например "getWBTariffService")
 * @returns Конфигурация сервиса или undefined, если сервис не найден
 */
export function getServiceConfig(serviceName: keyof Omit<ServicesConfig, "global">): ServiceConfig | undefined {
    return validatedConfig[serviceName];
}

export default validatedConfig;
