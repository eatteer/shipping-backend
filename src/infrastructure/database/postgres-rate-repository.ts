import { Rate } from "@domain/entities/rate";
import { RateRepository } from "@domain/repositories/rate-repository";
import { PostgresDb } from "@fastify/postgres";

export class PostgresRateRepository implements RateRepository {
  private readonly pg: PostgresDb;

  public constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  private mapRowToRate(row: any): Rate {
    return new Rate({
      id: row.id,
      originZoneId: row.origin_zone_id,
      destinationZoneId: row.destination_zone_id,
      pricePerKg: parseFloat(row.price_per_kg),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findByZoneIds(
    originZoneId: string,
    destinationZoneId: string
  ): Promise<Rate | null> {
    const query = `
      SELECT id, origin_zone_id, destination_zone_id, price_per_kg, created_at, updated_at
      FROM rates
      WHERE origin_zone_id = $1 AND destination_zone_id = $2;
    `;
    const result = await this.pg.query(query, [
      originZoneId,
      destinationZoneId,
    ]);

    return result.rows.length ? this.mapRowToRate(result.rows[0]) : null;
  }
}
