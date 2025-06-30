import { ShipmentStatus } from "@domain/entities/shipment-status";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";
import { PostgresDb } from "@fastify/postgres";

export class PostgresShipmentStatusRepository
  implements ShipmentStatusRepository
{
  private readonly pg: PostgresDb;

  public constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  private mapRowToShipmentStatus(row: any): ShipmentStatus {
    return new ShipmentStatus({
      id: row.id,
      name: row.name,
      description: row.description,
      isFinal: row.is_final,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  public async findById(id: string): Promise<ShipmentStatus | null> {
    const result = await this.pg.query(
      "SELECT * FROM status_types WHERE id = $1",
      [id]
    );

    return result.rows.length
      ? this.mapRowToShipmentStatus(result.rows[0])
      : null;
  }

  public async findByName(name: string): Promise<ShipmentStatus | null> {
    const result = await this.pg.query(
      "SELECT * FROM status_types WHERE name = $1",
      [name]
    );

    return result.rows.length
      ? this.mapRowToShipmentStatus(result.rows[0])
      : null;
  }

  public async findAll(): Promise<ShipmentStatus[]> {
    const result = await this.pg.query(
      "SELECT * FROM status_types ORDER BY name ASC"
    );

    return result.rows.map(this.mapRowToShipmentStatus);
  }
}
