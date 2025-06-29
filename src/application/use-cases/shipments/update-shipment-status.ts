import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";

export type UpdateShipmentStatusRequest = {
  shipmentId: string;
  newStatusId: string;
};

export class UpdateShipmentStatus {
  public constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly shipmentStatusRepository: ShipmentStatusRepository
  ) {}

  public async execute(request: UpdateShipmentStatusRequest): Promise<void> {
    const { shipmentId, newStatusId } = request;

    // 1. Find the shipment by its ID
    const shipment = await this.shipmentRepository.findById(shipmentId);

    // If the shipment is not found
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    // 2. Find the new status by its ID
    const newStatus = await this.shipmentStatusRepository.findById(newStatusId);

    // If the new status is not found
    if (!newStatus) {
      throw new NotFoundError("Shipment status not found");
    }

    // 3. Check if the shipment's current status is already the new status. If it is, no update is needed
    if (shipment.currentStatusId === newStatus.id) {
      return;
    }

    // 4. Update the shipment's status
    await this.shipmentRepository.updateStatus(shipmentId, newStatus.id);
  }
}
