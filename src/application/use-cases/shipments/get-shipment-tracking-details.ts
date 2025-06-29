import { AuthorizationError } from "@domain/errors/authorization-error";
import { NotFoundError } from "@domain/errors/not-found-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusHistoryRepository } from "@domain/repositories/shipment-status-history-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";

export type GetShipmentTrackingDetailsRequest = {
  shipmentId: string;
  userId: string;
};

export type GetShipmentTrackingDetailsResponse = {
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

export class GetShipmentTrackingDetails {
  public constructor(
    private readonly cityRepository: CityRepository,
    private readonly shipmentRepository: ShipmentRepository,
    private readonly shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository,
    private readonly shipmentStatusRepository: ShipmentStatusRepository
  ) {}

  public async execute(
    command: GetShipmentTrackingDetailsRequest
  ): Promise<GetShipmentTrackingDetailsResponse> {
    const { shipmentId, userId } = command;

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
