import { ShipmentStatusHistory } from "@domain/entities/shipment-status-history";

export interface ShipmentStatusHistoryRepository {
  save(historyEntry: ShipmentStatusHistory): Promise<void>;
  findByShipmentId(shipmentId: string): Promise<ShipmentStatusHistory[]>;
}
