/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    return knex.schema
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
        });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    return knex.schema
        .dropTableIfExists("spreadsheet")
        .dropTableIfExists("tariff_box")
        .dropTableIfExists("geo")
        .dropTableIfExists("warehouse");
}
