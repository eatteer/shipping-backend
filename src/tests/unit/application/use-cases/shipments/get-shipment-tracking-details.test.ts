import {
  GetShipmentTrackingDetails,
  GetShipmentTrackingDetailsRequest,
  GetShipmentTrackingDetailsResponse,
} from "@application/use-cases/shipments/get-shipment-tracking-details";
import { AuthorizationError } from "@domain/errors/authorization-error";
import { NotFoundError } from "@domain/errors/not-found-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusHistoryRepository } from "@domain/repositories/shipment-status-history-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";
import { Shipment } from "@domain/entities/shipment";
import { City } from "@domain/entities/city";
import { ShipmentStatus } from "@domain/entities/shipment-status";
import { ShipmentStatusHistory } from "@domain/entities/shipment-status-history";

describe("GetShipmentTrackingDetails", () => {
  let cityRepository: jest.Mocked<CityRepository>;
  let shipmentRepository: jest.Mocked<ShipmentRepository>;
  let shipmentStatusHistoryRepository: jest.Mocked<ShipmentStatusHistoryRepository>;
  let shipmentStatusRepository: jest.Mocked<ShipmentStatusRepository>;
  let getShipmentTrackingDetails: GetShipmentTrackingDetails;

  // Common test data
  const MOCK_SHIPMENT_ID = "shipment-abc-123";
  const MOCK_USER_ID = "user-xyz-456";
  const MOCK_OTHER_USER_ID = "user-other-789";
  const MOCK_ORIGIN_CITY_ID = "city-origin-id";
  const MOCK_DESTINATION_CITY_ID = "city-destination-id";
  const MOCK_STATUS_PENDING_ID = "status-1";
  const MOCK_STATUS_IN_TRANSIT_ID = "status-2";
  const MOCK_STATUS_DELIVERED_ID = "status-3";

  const MOCK_SHIPMENT: Shipment = {
    id: MOCK_SHIPMENT_ID,
    userId: MOCK_USER_ID,
    originCityId: MOCK_ORIGIN_CITY_ID,
    destinationCityId: MOCK_DESTINATION_CITY_ID,
    packageWeightKg: 5,
    packageLengthCm: 30,
    packageWidthCm: 20,
    packageHeightCm: 15,
    calculatedWeightKg: 7,
    quotedValue: 70000,
    currentStatusId: MOCK_STATUS_DELIVERED_ID, // Current status is Delivered
    createdAt: new Date("2023-01-01T10:00:00Z"),
    updatedAt: new Date("2023-01-03T15:00:00Z"),
  };

  const MOCK_ORIGIN_CITY: City = {
    id: MOCK_ORIGIN_CITY_ID,
    name: "Bogota",
    departmentId: "dep-1",
    zoneId: "zone-A",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_DESTINATION_CITY: City = {
    id: MOCK_DESTINATION_CITY_ID,
    name: "Medellin",
    departmentId: "dep-2",
    zoneId: "zone-B",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_STATUS_PENDING: ShipmentStatus = {
    id: MOCK_STATUS_PENDING_ID,
    name: "Pending",
    description: "Shipment is pending processing.",
    isFinal: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_STATUS_IN_TRANSIT: ShipmentStatus = {
    id: MOCK_STATUS_IN_TRANSIT_ID,
    name: "In Transit",
    description: "Shipment is currently in transit.",
    isFinal: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_STATUS_DELIVERED: ShipmentStatus = {
    id: MOCK_STATUS_DELIVERED_ID,
    name: "Delivered",
    isFinal: true,
    description: "Shipment has been successfully delivered.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_ALL_STATUSES: ShipmentStatus[] = [
    MOCK_STATUS_PENDING,
    MOCK_STATUS_IN_TRANSIT,
    MOCK_STATUS_DELIVERED,
  ];

  const MOCK_HISTORY_ENTRY_1: ShipmentStatusHistory = {
    id: "history-1",
    shipmentId: MOCK_SHIPMENT_ID,
    statusId: MOCK_STATUS_PENDING_ID,
    timestamp: new Date("2023-01-01T10:00:00Z"),
  };

  const MOCK_HISTORY_ENTRY_2: ShipmentStatusHistory = {
    id: "history-2",
    shipmentId: MOCK_SHIPMENT_ID,
    statusId: MOCK_STATUS_IN_TRANSIT_ID,
    timestamp: new Date("2023-01-02T12:00:00Z"),
  };

  const MOCK_HISTORY_ENTRY_3: ShipmentStatusHistory = {
    id: "history-3",
    shipmentId: MOCK_SHIPMENT_ID,
    statusId: MOCK_STATUS_DELIVERED_ID,
    timestamp: new Date("2023-01-03T15:00:00Z"),
  };

  const MOCK_SHIPMENT_HISTORY: ShipmentStatusHistory[] = [
    MOCK_HISTORY_ENTRY_1,
    MOCK_HISTORY_ENTRY_2,
    MOCK_HISTORY_ENTRY_3,
  ];

  beforeEach(() => {
    // Clear all mock calls and reset behavior before each test.
    jest.clearAllMocks();

    // Initialize repository mocks.
    cityRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    shipmentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    shipmentStatusHistoryRepository = {
      save: jest.fn(),
      findByShipmentId: jest.fn(),
    };

    shipmentStatusRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    };

    // Create a new instance of the use case with mocked dependencies.
    getShipmentTrackingDetails = new GetShipmentTrackingDetails(
      cityRepository,
      shipmentRepository,
      shipmentStatusHistoryRepository,
      shipmentStatusRepository
    );
  });

  describe("execute - successful retrieval", () => {
    it("should return complete shipment tracking details for an authorized user", async () => {
      // Set up mocks for a successful scenario.
      // The shipment repository finds the requested shipment.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);

      // The history repository returns the full status history for the shipment.
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      // The status repository provides all known shipment statuses.
      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);

      // The status repository finds the current status of the shipment.
      shipmentStatusRepository.findById.mockResolvedValue(
        MOCK_STATUS_DELIVERED
      );

      // The city repository provides the origin and destination city details in order.
      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY) // First call for origin city
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY); // Second call for destination city

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Execute the use case.
      const result: GetShipmentTrackingDetailsResponse =
        await getShipmentTrackingDetails.execute(request);

      // Assertions:
      // Verify that `shipmentRepository.findById` was called once with the shipment ID.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID
      );

      // Verify that `shipmentStatusHistoryRepository.findByShipmentId` was called once.
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledTimes(1);
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledWith(MOCK_SHIPMENT_ID);

      // Verify that `shipmentStatusRepository.findAll` was called once to get all status definitions.
      expect(shipmentStatusRepository.findAll).toHaveBeenCalledTimes(1);

      // Verify that `shipmentStatusRepository.findById` was called once to get the current status details.
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledWith(
        MOCK_SHIPMENT.currentStatusId
      );

      // Verify that `cityRepository.findById` was called twice (once for origin, once for destination).
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(cityRepository.findById).toHaveBeenCalledWith(MOCK_ORIGIN_CITY_ID);
      expect(cityRepository.findById).toHaveBeenCalledWith(
        MOCK_DESTINATION_CITY_ID
      );

      // Verify the structure and content of the returned tracking details.
      expect(result).toEqual({
        shipmentId: MOCK_SHIPMENT.id,
        originCity: MOCK_ORIGIN_CITY.name,
        destinationCity: MOCK_DESTINATION_CITY.name,
        packageWeightKg: MOCK_SHIPMENT.packageWeightKg,
        packageLengthCm: MOCK_SHIPMENT.packageLengthCm,
        packageWidthCm: MOCK_SHIPMENT.packageWidthCm,
        packageHeightCm: MOCK_SHIPMENT.packageHeightCm,
        calculatedWeightKg: MOCK_SHIPMENT.calculatedWeightKg,
        quotedValue: MOCK_SHIPMENT.quotedValue,
        currentStatus: MOCK_STATUS_DELIVERED.name, // The resolved name of the current status
        trackingHistory: [
          {
            statusId: MOCK_HISTORY_ENTRY_1.statusId,
            statusName: MOCK_STATUS_PENDING.name,
            statusDescription: MOCK_STATUS_PENDING.description,
            timestamp: MOCK_HISTORY_ENTRY_1.timestamp,
          },
          {
            statusId: MOCK_HISTORY_ENTRY_2.statusId,
            statusName: MOCK_STATUS_IN_TRANSIT.name,
            statusDescription: MOCK_STATUS_IN_TRANSIT.description,
            timestamp: MOCK_HISTORY_ENTRY_2.timestamp,
          },
          {
            statusId: MOCK_HISTORY_ENTRY_3.statusId,
            statusName: MOCK_STATUS_DELIVERED.name,
            statusDescription: MOCK_STATUS_DELIVERED.description,
            timestamp: MOCK_HISTORY_ENTRY_3.timestamp,
          },
        ],
        lastUpdate: MOCK_SHIPMENT.updatedAt,
      });
    });

    it('should return "Unknown Status" if the current status entity is not found', async () => {
      // Configure the shipment to have a `currentStatusId` that won't be found by `shipmentStatusRepository.findById`.
      shipmentRepository.findById.mockResolvedValue({
        ...MOCK_SHIPMENT,
        currentStatusId: "non-existent-status",
      });

      // Mocks for other dependencies remain consistent.
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);
      shipmentStatusRepository.findById.mockResolvedValue(null); // Simulate current status not found.

      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY)
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Execute the use case.
      const result = await getShipmentTrackingDetails.execute(request);

      // Assertion: Verify that `currentStatus` in the response is "Unknown Status".
      expect(result.currentStatus).toBe("Unknown Status");
    });
  });

  describe("execute - validation and authorization errors", () => {
    it("should throw NotFoundError if the shipment is not found", async () => {
      // Configure `shipmentRepository.findById` to return null, indicating the shipment doesn't exist.
      shipmentRepository.findById.mockResolvedValue(null);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: "non-existent-shipment-id",
        userId: MOCK_USER_ID,
      };

      // Expect the use case to reject with a `NotFoundError`.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        NotFoundError
      );

      // Assertions:
      // Verify `findById` was called with the requested ID.
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        "non-existent-shipment-id"
      );

      // Ensure no further repository calls were made as the shipment was not found.
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).not.toHaveBeenCalled();

      expect(shipmentStatusRepository.findAll).not.toHaveBeenCalled();
      expect(cityRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw AuthorizationError if the user does not own the shipment", async () => {
      // Configure `shipmentRepository.findById` to return a shipment owned by a different user.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_OTHER_USER_ID, // This user ID does not match MOCK_SHIPMENT.userId
      };

      // Expect the use case to reject with an `AuthorizationError`.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        AuthorizationError
      );

      // Assertions:
      // Verify `findById` was called to retrieve the shipment.
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID
      );

      // Ensure no further operations (like fetching history or statuses) were attempted due to authorization failure.
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).not.toHaveBeenCalled();

      expect(shipmentStatusRepository.findAll).not.toHaveBeenCalled();
      expect(cityRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if origin city is not found for the shipment", async () => {
      // Set up mocks for a scenario where the shipment and its history/statuses are found,
      // but the origin city linked to the shipment cannot be found.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);
      shipmentStatusRepository.findById.mockResolvedValue(
        MOCK_STATUS_DELIVERED
      );

      cityRepository.findById.mockResolvedValueOnce(null); // Simulate origin city not found.

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to reject with a `NotFoundError`.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        NotFoundError
      );

      // Assertions:
      // Verify calls up to the point of failure.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);

      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledTimes(1);

      expect(shipmentStatusRepository.findAll).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(1); // Only the first `findById` for cities should be called.
      expect(cityRepository.findById).toHaveBeenCalledWith(MOCK_ORIGIN_CITY_ID);
    });

    it("should throw NotFoundError if destination city is not found for the shipment", async () => {
      // Similar to the above, but the destination city is not found.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);
      shipmentStatusRepository.findById.mockResolvedValue(
        MOCK_STATUS_DELIVERED
      );

      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY) // Origin city found.
        .mockResolvedValueOnce(null); // Destination city not found.

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to reject with a `NotFoundError`.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        NotFoundError
      );

      // Assertions:
      // Verify all preceding calls.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);

      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledTimes(1);

      expect(shipmentStatusRepository.findAll).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(2); // Both city `findById` calls should occur.
      expect(cityRepository.findById).toHaveBeenCalledWith(
        MOCK_DESTINATION_CITY_ID
      );
    });
  });

  describe("execute - dependency errors", () => {
    it("should throw an error if shipmentRepository.findById fails", async () => {
      const mockError = new Error("Shipment DB error");
      // Configure `shipmentRepository.findById` to reject, simulating a database error.
      shipmentRepository.findById.mockRejectedValue(mockError);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to re-throw the underlying error.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify `findById` was called.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);

      // Ensure other repositories were not called.
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).not.toHaveBeenCalled();
    });

    it("should throw an error if shipmentStatusHistoryRepository.findByShipmentId fails", async () => {
      const mockError = new Error("History DB error");

      // Shipment found successfully.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);

      // But `findByShipmentId` for history rejects.
      shipmentStatusHistoryRepository.findByShipmentId.mockRejectedValue(
        mockError
      );

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to re-throw the history repository error.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify calls up to the point of failure.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledTimes(1);

      // Ensure no further calls were made.
      expect(shipmentStatusRepository.findAll).not.toHaveBeenCalled();
    });

    it("should throw an error if shipmentStatusRepository.findAll fails", async () => {
      const mockError = new Error("Status DB error");

      // Shipment and history found successfully.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      // But `findAll` for shipment statuses rejects.
      shipmentStatusRepository.findAll.mockRejectedValue(mockError);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to re-throw the status repository error.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify calls up to the point of failure.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledTimes(1);

      expect(shipmentStatusRepository.findAll).toHaveBeenCalledTimes(1);

      // Ensure `findById` for current status was not called.
      expect(shipmentStatusRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw an error if shipmentStatusRepository.findById for current status fails", async () => {
      const mockError = new Error("Current Status DB error");

      // Shipment, history, and all statuses found successfully.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);

      // But `findById` for the current status rejects.
      shipmentStatusRepository.findById.mockRejectedValue(mockError);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to re-throw the specific status error.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify all preceding calls were made.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);

      expect(
        shipmentStatusHistoryRepository.findByShipmentId
      ).toHaveBeenCalledTimes(1);

      expect(shipmentStatusRepository.findAll).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if cityRepository.findById for origin city fails", async () => {
      const mockError = new Error("City DB error");

      // Shipment, history, and statuses found successfully.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);
      shipmentStatusRepository.findById.mockResolvedValue(
        MOCK_STATUS_DELIVERED
      );

      // But `findById` for the origin city rejects.
      cityRepository.findById.mockRejectedValueOnce(mockError);

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to re-throw the city repository error.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify calls up to the point of origin city lookup.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if cityRepository.findById for destination city fails", async () => {
      const mockError = new Error("City DB error");

      // All previous steps succeed, including origin city lookup.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusHistoryRepository.findByShipmentId.mockResolvedValue(
        MOCK_SHIPMENT_HISTORY
      );

      shipmentStatusRepository.findAll.mockResolvedValue(MOCK_ALL_STATUSES);
      shipmentStatusRepository.findById.mockResolvedValue(
        MOCK_STATUS_DELIVERED
      );

      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY) // Origin city found.
        .mockRejectedValueOnce(mockError); // Destination city lookup fails.

      const request: GetShipmentTrackingDetailsRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        userId: MOCK_USER_ID,
      };

      // Expect the use case to re-throw the city repository error.
      await expect(getShipmentTrackingDetails.execute(request)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify both city `findById` calls happened, with the second one failing.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
    });
  });
});
