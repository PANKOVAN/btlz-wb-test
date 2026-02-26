import knex from "#postgres/knex.js";


/**
 * Управляет всеми складами и геозонами
 */
export class GeoHelper {
    private static geoHash: { [geoName: string]: { geoId: number, warehouseHash: { [warehouseName: string]: number } } } = {};
    constructor() {
    }
    public async getGeoId(geoName: string): Promise<number> {
        let geoId: number=GeoHelper.geoHash[geoName]?.geoId;
        if (!geoId) {
            geoId = (await knex('geo').select('id').where({'name': geoName}).first())?.id;
            if (!geoId) {
                geoId = (await knex('geo').insert({ name: geoName }).returning('id'))[0].id;
                GeoHelper.geoHash[geoName] = { geoId: geoId, warehouseHash: {} };
            }
        }
        return geoId;
    }
    public async getWarehouseId(geoName: string, warehouseName: string): Promise<number> {
        let geoId: number=GeoHelper.geoHash[geoName]?.geoId;
        if (!geoId) {
            geoId = (await knex('geo').insert({ name: geoName }).onConflict('name').merge().returning('id'))[0].id;
            if (!GeoHelper.geoHash[geoName]) GeoHelper.geoHash[geoName] = { geoId: geoId, warehouseHash: {} };
        }
        let warehouseHash: { [warehouseName: string]: number }=GeoHelper.geoHash[geoName]?.warehouseHash;
        if (!warehouseHash) {
            let warehouseId:number = (await knex('warehouse').insert({ name: warehouseName, geo_id: geoId }).onConflict(['name', 'geo_id']).merge().returning('id'))[0].id;
            warehouseHash = {};
            warehouseHash[warehouseName] = warehouseId;
            GeoHelper.geoHash[geoName] = { geoId: geoId, warehouseHash: warehouseHash };
        }
        let warehouseId: number=warehouseHash[warehouseName];
        if (warehouseId==undefined) {
            warehouseId = (await knex('warehouse').insert({ name: warehouseName, geo_id: geoId  }).onConflict(['name', 'geo_id']).merge().returning('id'))[0].id;
            warehouseHash[warehouseName] = warehouseId;
        }
        return warehouseId;
    }
}
