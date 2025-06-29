import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";

/**
 * Request data for updating shipment status.
 * 
 * Contains the essential information required to update a shipment's
 * current status to a new status.
 * 
 * @since 1.0.0
 */
export type UpdateShipmentStatusRequest = {
  /** Unique identifier of the shipment to update */
  shipmentId: string;
  /** Unique identifier of the new status to set */
  newStatusId: string;
};

/**
 * Response data for successful shipment status update.
 * 
 * Contains confirmation of the status update operation.
 * 
 * @since 1.0.0
 */
export type UpdateShipmentStatusResponse = {
  /** Confirmation message indicating successful status update */
  message: string;
};

/**
 * Use case for updating shipment status.
 * 
 * This use case handles the business logic for updating shipment statuses.
 * It validates the shipment and status exist, and updates the current status
 * only if it's different from the current one.
 * 
 * @since 1.0.0
 */
export class UpdateShipmentStatus {
  /**
   * Creates a new UpdateShipmentStatus use case instance.
   * 
   * @param shipmentRepository - Repository for shipment data operations
   * @param shipmentStatusRepository - Repository for shipment status operations
   */
  public constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly shipmentStatusRepository: ShipmentStatusRepository
  ) { }

  /**
   * Executes the shipment status update process.
   * 
   * Performs the complete status update workflow:
   * 1. Validates that the shipment exists
   * 2. Validates that the new status exists
   * 3. Checks if the status is already the same (no update needed)
   * 4. Updates the shipment's status if different
   * 
   * @param request - Status update data containing shipment ID and new status ID
   * 
   * @example
   * ```typescript
   * const updateStatus = new UpdateShipmentStatus(
   *   shipmentRepository,
   *   shipmentStatusRepository
   * );
   * 
   * await updateStatus.execute({
   *   shipmentId: "shipment-123",
   *   newStatusId: "status-in-transit"
   * });
   * ```
   * 
   * @throws {NotFoundError} When the shipment is not found
   * @throws {NotFoundError} When the status is not found
   * @throws {Error} When database operations fail
   * 
   * @returns Promise that resolves when status update is complete
   * 
   * @since 1.0.0
   */
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
