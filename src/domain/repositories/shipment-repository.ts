import { Shipment } from "@domain/entities/shipment";

export interface ShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByUserId(userId: string): Promise<Shipment[]>;
  findAll(): Promise<Shipment[]>;
  save(shipment: Shipment): Promise<void>;
  update(shipment: Shipment): Promise<void>;
}
