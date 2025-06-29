import { AuthorizationError } from "@domain/errors/authorization-error";
import { NotFoundError } from "@domain/errors/not-found-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusHistoryRepository } from "@domain/repositories/shipment-status-history-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";

/**
 * Request data for retrieving shipment tracking details.
 *
 * Contains the unique identifier of the shipment to track.
 *
 * @since 1.0.0
 */
export type GetShipmentTrackingDetailsRequest = {
  /** Unique identifier of the shipment to track */
  shipmentId: string;
  userId: string;
};

/**
 * Response data for shipment tracking details.
 *
 * Contains comprehensive tracking information including shipment details,
 * current status, and complete status history timeline.
 *
 * @since 1.0.0
 */
export type GetShipmentTrackingDetailsResponse = {
  /** Unique identifier of the shipment */
  shipmentId: string;
  originCity: string;
  destinationCity: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  calculatedWeightKg: number;
  quotedValue: number;
  currentStatus: string;
  trackingHistory: TrackingHistoryEntry[];
  lastUpdate: Date;
};

export type TrackingHistoryEntry = {
  statusName: string;
  timestamp: Date;
};

/**
 * Use case for retrieving shipment tracking details.
 *
 * This use case handles the business logic for retrieving comprehensive
 * tracking information for a specific shipment, including current status
 * and complete history timeline.
 *
 * @since 1.0.0
 */
export class GetShipmentTrackingDetails {
  /**
   * Creates a new GetShipmentTrackingDetails use case instance.
   *
   * @param cityRepository - Repository for city data operations
   * @param shipmentRepository - Repository for shipment data operations
   * @param shipmentStatusHistoryRepository - Repository for shipment status history operations
   * @param shipmentStatusRepository - Repository for shipment status operations
   */
  public constructor(
    private readonly cityRepository: CityRepository,
    private readonly shipmentRepository: ShipmentRepository,
    private readonly shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository,
    private readonly shipmentStatusRepository: ShipmentStatusRepository
  ) {}

  /**
   * Executes the shipment tracking details retrieval process.
   *
   * Performs the complete tracking details workflow:
   * 1. Validates that the shipment exists
   * 2. Retrieves the current shipment status
   * 3. Fetches the complete status history timeline
   * 4. Returns comprehensive tracking information
   *
   * @param request - Tracking request containing the shipment ID and user ID
   *
   * @example
   * ```typescript
   * const getTrackingDetails = new GetShipmentTrackingDetails(
   *   cityRepository,
   *   shipmentRepository,
   *   shipmentStatusHistoryRepository,
   *   shipmentStatusRepository
   * );
   *
   * const trackingInfo = await getTrackingDetails.execute({
   *   shipmentId: "shipment-123",
   *   userId: "user-123"
   * });
   *
   * console.log(trackingInfo.currentStatus); // Current status
   * console.log(trackingInfo.trackingHistory); // Complete timeline
   * ```
   *
   * @throws {NotFoundError} When the shipment is not found
   * @throws {AuthorizationError} When access is denied to the shipment's details
   * @throws {Error} When database operations fail
   *
   * @returns Promise that resolves to the tracking details response
   *
   * @since 1.0.0
   */
  public async execute(
    request: GetShipmentTrackingDetailsRequest
  ): Promise<GetShipmentTrackingDetailsResponse> {
    const { shipmentId, userId } = request;

    // 1. Fetch the shipment by its ID
    const shipment = await this.shipmentRepository.findById(shipmentId);

    // If shipment is not found
    if (!shipment) {
      throw new NotFoundError("Shipment not found");
    }

    // 2. Ensure the requesting user owns this shipment
    if (shipment.userId !== userId) {
      throw new AuthorizationError("Access denied to this shipment's details");
    }

    // 3. Fetch shipment status history entries
    const historyEntries =
      await this.shipmentStatusHistoryRepository.findByShipmentId(shipmentId);

    // 4. Fetch all available shipment statuses to map IDs to names
    const allStatuses = await this.shipmentStatusRepository.findAll();
    const statusMap = new Map<string, string>();

    allStatuses.forEach((status) => statusMap.set(status.id, status.name));

    // 5. Map history entries to include status names
    const trackingHistory: TrackingHistoryEntry[] = historyEntries.map(
      (entry) => ({
        statusName: statusMap.get(entry.statusId) || "Unknown Status",
        timestamp: entry.timestamp,
      })
    );

    // 6. Determine the current status name
    const currentStatusEntity = await this.shipmentStatusRepository.findById(
      shipment.currentStatusId
    );

    const currentStatusName = currentStatusEntity
      ? currentStatusEntity.name
      : "Unknown Status";

    // 7. Fetch origin and destination city details
    const originCity = await this.cityRepository.findById(
      shipment.originCityId
    );

    // If origin city is not found
    if (!originCity) {
      throw new NotFoundError("Origin city for shipment not found");
    }

    const destinationCity = await this.cityRepository.findById(
      shipment.destinationCityId
    );

    // If destination city is not found
    if (!destinationCity) {
      throw new NotFoundError("Destination city for shipment not found");
    }

    // 8. Assemble and return the tracking details response
    return {
      shipmentId: shipment.id,
      originCity: originCity.name,
      destinationCity: destinationCity.name,
      packageWeightKg: shipment.packageWeightKg,
      packageLengthCm: shipment.packageLengthCm,
      packageWidthCm: shipment.packageWidthCm,
      packageHeightCm: shipment.packageHeightCm,
      calculatedWeightKg: shipment.calculatedWeightKg,
      quotedValue: shipment.quotedValue,
      currentStatus: currentStatusName,
      trackingHistory: trackingHistory,
      lastUpdate: shipment.updatedAt,
    };
  }
}
