import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";

type UpdateShipmentStatusExecuteParams = {
  shipmentId: string;
  newStatusId: string;
};

export class UpdateShipmentStatus {
  public constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly shipmentStatusRepository: ShipmentStatusRepository
  ) {}

  public async execute(
    request: UpdateShipmentStatusExecuteParams
  ): Promise<void> {
    const { shipmentId, newStatusId } = request;

    const shipment = await this.shipmentRepository.findById(shipmentId);

    if (!shipment) {
      throw new NotFoundError(`Shipment with ID ${shipmentId} not found`);
    }

    const newStatus = await this.shipmentStatusRepository.findById(newStatusId);

    if (!newStatus) {
      throw new NotFoundError(
        `Shipment status with ID '${newStatusId}' not found`
      );
    }

    if (shipment.currentStatusId === newStatus.id) return;

    await this.shipmentRepository.updateStatus(shipmentId, newStatus.id);
  }
}
