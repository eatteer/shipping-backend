import { ShipmentStatus } from "@domain/entities/shipment-status";

export interface ShipmentStatusRepository {
  findById(id: string): Promise<ShipmentStatus | null>;
  findByName(name: string): Promise<ShipmentStatus | null>;
  findAll(): Promise<ShipmentStatus[]>;
}
