import { schedule, type ScheduledTask } from "node-cron";
import { getServiceConfig, ServiceConfig } from "#config/services/services.config.js";
import log4js from "log4js";
import { formatDateTimeLocal } from "#utils/dateUtils.js";

const logger = log4js.getLogger("ScheduledService");

/**
 * Базовый класс для сервисов с расписанием
 * Расширьте этот класс для создания собственного сервиса с расписанием
 */
export abstract class ScheduledService {
    readonly serviceName: string;
    protected config: ServiceConfig | undefined;
    protected isRunning: boolean = false;
    protected cronTask: ScheduledTask | undefined;
    protected logger: log4js.Logger|undefined;
    /**
     * @param serviceName - Ключ конфигурации сервиса (например, "getWBTariffService").
     *                      Если не указан, берется из имени класса и преобразуется в camelCase
     */
    constructor(serviceName?: string) {
        this.serviceName = serviceName || this.constructor.name;

        this.config = getServiceConfig(this.serviceName as any);
        if (!this.config) {
            throw new Error(`Configuration for service "${serviceName}" not found`);
        }
        this.logger = log4js.getLogger(this.serviceName);
    }
    

    /**
     * Запустить сервис с расписанием
     */
    public start(): void {
        if (this.cronTask) {
            this.logger?.warn(`Service already started`);
            return;
        }

        this.cronTask = schedule(
            this.config?.cronExpression || "*/1 * * * *",
            async () => {
                if (this.isRunning) {
                    this.logger?.warn(`Service already executing`);
                    return;
                }

                this.isRunning = true;
                this.logger?.info(`Service started (${formatDateTimeLocal(new Date())})`);
                try {
                    await this.execute();
                    this.logger?.info(`Service completed (${formatDateTimeLocal(new Date())})`);
                } catch (error) {
                    this.logger?.error(`Error executing service`, error);
                    await this.onError(error);
                } finally {
                    this.isRunning = false;
                }
            },
            {
                scheduled: true,
                timezone: this.config?.timezone || "UTC",
            }
        );
    }

    /**
     * Остановить сервис с расписанием
     */
    public stop(): void {
        if (this.cronTask) {
            this.cronTask.stop();
            this.cronTask = undefined;
            this.logger?.info(`Сервис остановлен: ${this.serviceName} (${formatDateTimeLocal(new Date())})`);
        }
    }

    /**
     * Выполнить логику сервиса - реализуйте этот метод в подклассе
     */
    protected abstract execute(): Promise<void>;

    /**
     * Обработать ошибки - переопределите этот метод в подклассе при необходимости
     */
    protected async onError(error: unknown): Promise<void> {

    };

}
