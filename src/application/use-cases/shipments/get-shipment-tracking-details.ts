import { ApplicationError } from "@domain/errors/application-error";
import { NotFoundError } from "@domain/errors/not-found-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusHistoryRepository } from "@domain/repositories/shipment-status-history-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";

export interface GetShipmentTrackingDetailsCommand {
  shipmentId: string;
  userId: string;
}

export interface TrackingHistoryEntry {
  statusName: string;
  timestamp: Date;
}

export interface GetShipmentTrackingDetailsResponse {
  shipmentId: string;
  originCity: string;
  destinationCity: string;
  packageWeightKg: number;
  currentStatus: string;
  trackingHistory: TrackingHistoryEntry[];
  lastUpdate: Date;
}

export class GetShipmentTrackingDetails {
  public constructor(
    private readonly cityRepository: CityRepository,
    private readonly shipmentRepository: ShipmentRepository,
    private readonly shipmentStatusHistoryRepository: ShipmentStatusHistoryRepository,
    private readonly shipmentStatusRepository: ShipmentStatusRepository
  ) {}

  public async execute(
    command: GetShipmentTrackingDetailsCommand
  ): Promise<GetShipmentTrackingDetailsResponse> {
    const { shipmentId, userId } = command;

    const shipment = await this.shipmentRepository.findById(shipmentId);

    console.log({ shipment });

    if (!shipment) {
      throw new NotFoundError(`Shipment with ID ${shipmentId} not found.`);
    }

    if (shipment.userId !== userId) {
      throw new ApplicationError(
        "Access denied to this shipment's tracking details.",
        "FORBIDDEN_ACCESS"
      );
    }

    const historyEntries =
      await this.shipmentStatusHistoryRepository.findByShipmentId(shipmentId);

    const allStatuses = await this.shipmentStatusRepository.findAll();
    const statusMap = new Map<string, string>();

    allStatuses.forEach((status) => statusMap.set(status.id, status.name));

    const trackingHistory: TrackingHistoryEntry[] = historyEntries.map(
      (entry) => ({
        statusName: statusMap.get(entry.statusId) || "Unknown Status",
        timestamp: entry.timestamp,
      })
    );

    const currentStatusEntity = await this.shipmentStatusRepository.findById(
      shipment.currentStatusId
    );

    const currentStatusName = currentStatusEntity
      ? currentStatusEntity.name
      : "Unknown Status";

    const originCity = await this.cityRepository.findById(
      shipment.originCityId
    );

    const destinationCity = await this.cityRepository.findById(
      shipment.destinationCityId
    );

    return {
      shipmentId: shipment.id,
      originCity: originCity?.name!,
      destinationCity: destinationCity?.name!,
      packageWeightKg: shipment.packageWeightKg,
      currentStatus: currentStatusName,
      trackingHistory: trackingHistory,
      lastUpdate: shipment.updatedAt,
    };
  }
}
