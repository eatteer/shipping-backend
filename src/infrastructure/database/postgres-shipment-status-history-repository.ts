import { ShipmentStatusHistory } from "@domain/entities/shipment-status-history";
import { ShipmentStatusHistoryRepository } from "@domain/repositories/shipment-status-history-repository";
import { PostgresDb } from "@fastify/postgres";

export class PostgresShipmentStatusHistoryRepository
  implements ShipmentStatusHistoryRepository
{
  private readonly pg: PostgresDb;

  public constructor(pg: PostgresDb) {
    this.pg = pg;
  }

  private mapRowToShipmentStatusHistory(row: any): ShipmentStatusHistory {
    return new ShipmentStatusHistory({
      id: row.id,
      shipmentId: row.shipment_id,
      statusId: row.status_id,
      timestamp: row.timestamp,
    });
  }

  public async save(historyEntry: ShipmentStatusHistory): Promise<void> {
    await this.pg.query(
      `
        INSERT INTO shipment_status_history (id, shipment_id, status_id, timestamp)
        VALUES ($1, $2, $3, $4);
      `,
      [
        historyEntry.id,
        historyEntry.shipmentId,
        historyEntry.statusId,
        historyEntry.timestamp,
      ]
    );
  }

  public async findByShipmentId(
    shipmentId: string
  ): Promise<ShipmentStatusHistory[]> {
    const result = await this.pg.query(
      `
        SELECT
            ssh.id,
            ssh.shipment_id,
            ssh.status_id,
            ssh.timestamp
        FROM shipment_status_history ssh
        WHERE ssh.shipment_id = $1
        ORDER BY ssh.timestamp ASC;
      `,
      [shipmentId]
    );

    return result.rows.map(this.mapRowToShipmentStatusHistory);
  }
}
