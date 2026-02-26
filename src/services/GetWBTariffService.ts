import { ScheduledService } from "./ScheduledService.js";
import env from "#config/env/env.js";
import log4js from "log4js";
const logger = log4js.getLogger("GetWBTariffService");
import { GeoHelper } from "#postgres/warehouseHelper.js";
import knex from "#postgres/knex.js";
import { formatDateLocal } from "#utils/dateUtils.js";

type TariffBox = {
    date: Date,
    boxDeliveryBase: number|null,
    boxDeliveryCoefExpr: number|null,
    boxDeliveryLiter: number|null,
    boxDeliveryMarketplaceBase: number|null,
    boxDeliveryMarketplaceCoefExpr: number|null,
    boxDeliveryMarketplaceLiter: number|null,
    boxStorageBase: number|null,
    boxStorageCoefExpr: number|null,
    boxStorageLiter: number|null,
    warehouseName: string,
    geoName: string,

}

/**
 * Сервис для получения тарифов Wildberries
 */
export class GetWBTariffService extends ScheduledService {
    private readonly apiUrl = "https://common-api.wildberries.ru/api/v1/tariffs/box";
    protected async execute(): Promise<void> {
        try {
            const data = await this.getData();
            this.logger?.info(`Получено ${data.length} записей тарифов`);
            await this.saveData(data);
            this.logger?.info(`Записаны ${data.length} записей тарифов`);
        } catch (error) {
            throw error;
        }
    }

    private getNumber(value: any): number|null {
        if (value === null || value === undefined || value === '-' || value == '' ) {
            return null;
        }
        let number = Number(value.replaceAll(/,/g, '.'));
        if (isNaN(number)) {
            return null;
        }
        return number;
    }
    protected async getData(): Promise<TariffBox[]> {
        const date = formatDateLocal(new Date());
        const url = new URL(this.apiUrl);
        url.searchParams.append("date", date);

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${env.WB_API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json())?.response?.data;
        const warehouses:  any[] = data.warehouseList;


        if (!Array.isArray(warehouses)) {
            throw new Error(`Invalid warehouses format`);
        }

        return warehouses.map((item: any) => {
            return {
                date: new Date(date),
                boxDeliveryBase: this.getNumber(item.boxDeliveryBase),
                boxDeliveryCoefExpr: this.getNumber(item.boxDeliveryCoefExpr),
                boxDeliveryLiter: this.getNumber(item.boxDeliveryLiter),
                boxDeliveryMarketplaceBase: this.getNumber(item.boxDeliveryMarketplaceBase),
                boxDeliveryMarketplaceCoefExpr: this.getNumber(item.boxDeliveryMarketplaceCoefExpr),
                boxDeliveryMarketplaceLiter: this.getNumber(item.boxDeliveryMarketplaceLiter),
                boxStorageBase: this.getNumber(item.boxStorageBase),
                boxStorageCoefExpr: this.getNumber(item.boxStorageCoefExpr),
                boxStorageLiter: this.getNumber(item.boxStorageLiter),
                warehouseName: item.warehouseName,
                geoName: item.geoName,
            };
        });
    }
    protected async saveData(data: TariffBox[]): Promise<void> {
        const geoHelper = new GeoHelper();
        let rows: any[] = [];
        
        // Подготовка данных
        for (const item of data) {
            let warehouseId = await geoHelper.getWarehouseId(item.geoName, item.warehouseName);
            rows.push({
                date: item.date,
                boxDeliveryBase: item.boxDeliveryBase,
                boxDeliveryCoefExpr: item.boxDeliveryCoefExpr,
                boxDeliveryLiter: item.boxDeliveryLiter,
                boxDeliveryMarketplaceBase: item.boxDeliveryMarketplaceBase,
                boxDeliveryMarketplaceCoefExpr: item.boxDeliveryMarketplaceCoefExpr,
                boxDeliveryMarketplaceLiter: item.boxDeliveryMarketplaceLiter,
                boxStorageBase: item.boxStorageBase,
                boxStorageCoefExpr: item.boxStorageCoefExpr,
                boxStorageLiter: item.boxStorageLiter,
                warehouse_id: warehouseId,
            });
        }

        // Используем транзакцию для атомарности операции
        await knex.transaction(async (trx) => {
            // Разбиваем на батчи по 100 записей для избежания проблем с большими запросами
            const BATCH_SIZE = 100;
            let insertedCount = 0;
            
            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE);
                await trx('tariff_box')
                    .insert(batch)
                    .onConflict(['date', 'warehouse_id'])
                    .merge();
                insertedCount += batch.length;
            }
            
        });
    }
}
