// src/infrastructure/database/postgres-shipment-repository.ts
import { Shipment } from "@domain/entities/shipment";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { PostgresDb } from "@fastify/postgres";
import { PoolClient } from "pg";

export class PostgresShipmentRepository implements ShipmentRepository {
  private readonly pg: PostgresDb;

  public constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  private mapRowToShipment(row: any): Shipment {
    return new Shipment({
      id: row.id,
      userId: row.user_id,
      originCityId: row.origin_city_id,
      destinationCityId: row.destination_city_id,
      packageWeightKg: parseFloat(row.package_weight_kg),
      packageLengthCm: parseFloat(row.package_length_cm),
      packageWidthCm: parseFloat(row.package_width_cm),
      packageHeightCm: parseFloat(row.package_height_cm),
      calculatedWeightKg: parseFloat(row.calculated_weight_kg),
      quotedValue: parseFloat(row.quoted_value),
      currentStatusId: row.current_status_id, // Este seguirá mapeándose al leer
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  public async findById(id: string): Promise<Shipment | null> {
    const result = await this.pg.query(
      "SELECT * FROM shipments WHERE id = $1",
      [id]
    );

    return result.rows.length ? this.mapRowToShipment(result.rows[0]) : null;
  }

  public async findByUserId(userId: string): Promise<Shipment[]> {
    const result = await this.pg.query(
      "SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    return result.rows.map(this.mapRowToShipment);
  }

  public async findAll(): Promise<Shipment[]> {
    const result = await this.pg.query(
      "SELECT * FROM shipments ORDER BY created_at DESC"
    );

    return result.rows.map(this.mapRowToShipment);
  }

  public async save(shipment: Shipment): Promise<void> {
    let client: PoolClient | null = null;

    try {
      client = await this.pg.connect();

      await client.query("BEGIN");

      const query = `
        INSERT INTO shipments (
          id, user_id, origin_city_id, destination_city_id,
          package_weight_kg, package_length_cm, package_width_cm, package_height_cm,
          calculated_weight_kg, quoted_value, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          origin_city_id = EXCLUDED.origin_city_id,
          destination_city_id = EXCLUDED.destination_city_id,
          package_weight_kg = EXCLUDED.package_weight_kg,
          package_length_cm = EXCLUDED.package_length_cm,
          package_width_cm = EXCLUDED.package_width_cm,
          package_height_cm = EXCLUDED.package_height_cm,
          calculated_weight_kg = EXCLUDED.calculated_weight_kg,
          quoted_value = EXCLUDED.quoted_value,
          updated_at = EXCLUDED.updated_at;
      `;

      const values = [
        shipment.id,
        shipment.userId,
        shipment.originCityId,
        shipment.destinationCityId,
        shipment.packageWeightKg,
        shipment.packageLengthCm,
        shipment.packageWidthCm,
        shipment.packageHeightCm,
        shipment.calculatedWeightKg,
        shipment.quotedValue,
        shipment.createdAt,
        shipment.updatedAt,
      ];

      await client.query(query, values);

      await client.query("COMMIT");
    } catch (error) {
      if (client) {
        await client.query("ROLLBACK");
      }

      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
