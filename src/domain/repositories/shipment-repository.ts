import { Shipment } from "@domain/entities/shipment";

export interface ShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByUserId(userId: string): Promise<Shipment[] | null>;
  findAll(): Promise<Shipment[] | null>;
  save(user: Shipment): Promise<void>;
}
