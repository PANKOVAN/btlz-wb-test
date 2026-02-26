import { ScheduledService } from "./ScheduledService.js";
import log4js from "log4js";

const logger = log4js.getLogger("Scheduler");

/**
 * Управляет всеми сервисами с расписанием
 */
export class Scheduler {
    private services: Map<string, ScheduledService> = new Map();

    /**
     * Зарегистрировать сервис с расписанием
     */
    public register(service: ScheduledService): void {
        this.services.set(service.serviceName, service);
        logger.info(`Registered service: ${service.serviceName}`);
    }

    /**
     * Запустить все зарегистрированные сервисы
     */
    public startAll(): void {
        this.services.forEach((service) => {
            service.start();
        });
    }

    /**
     * Остановить все зарегистрированные сервисы
     */
    public stopAll(): void {
        this.services.forEach((service) => {
            service.stop();
        });
    }


}
