import {
  UpdateShipmentStatus,
  UpdateShipmentStatusRequest,
} from "@application/use-cases/shipments/update-shipment-status";
import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { ShipmentStatusRepository } from "@domain/repositories/shipment-status-repository";
import { Shipment } from "@domain/entities/shipment";
import { ShipmentStatus } from "@domain/entities/shipment-status";

describe("UpdateShipmentStatus", () => {
  let shipmentRepository: jest.Mocked<ShipmentRepository>;
  let shipmentStatusRepository: jest.Mocked<ShipmentStatusRepository>;
  let updateShipmentStatus: UpdateShipmentStatus;

  // Common test data
  const MOCK_SHIPMENT_ID = "shipment-123";
  const MOCK_CURRENT_STATUS_ID = "status-pending";
  const MOCK_NEW_STATUS_ID = "status-in-transit";
  const MOCK_NON_EXISTENT_ID = "non-existent-id";

  const MOCK_SHIPMENT: Shipment = {
    id: MOCK_SHIPMENT_ID,
    userId: "user-xyz",
    originCityId: "city-A",
    destinationCityId: "city-B",
    packageWeightKg: 5,
    packageLengthCm: 30,
    packageWidthCm: 20,
    packageHeightCm: 15,
    calculatedWeightKg: 7,
    quotedValue: 100,
    currentStatusId: MOCK_CURRENT_STATUS_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_NEW_STATUS: ShipmentStatus = {
    id: MOCK_NEW_STATUS_ID,
    name: "In Transit",
    isFinal: false,
    description: "Shipment is on its way.",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_CURRENT_STATUS: ShipmentStatus = {
    id: MOCK_CURRENT_STATUS_ID,
    name: "Pending",
    description: "Shipment is waiting to be processed.",
    isFinal: false,
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(() => {
    // Clear all mocks before each test to ensure test isolation.
    jest.clearAllMocks();

    // Initialize mocked repositories.
    shipmentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(), // Ensure this method is properly mocked
    };

    shipmentStatusRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
    };

    // Create a new instance of the use case for each test.
    updateShipmentStatus = new UpdateShipmentStatus(
      shipmentRepository,
      shipmentStatusRepository
    );
  });

  describe("execute - successful update", () => {
    it("should update the shipment status if the new status is different from the current one", async () => {
      // Arrange: Configure mocks for a successful update scenario.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusRepository.findById.mockResolvedValue(MOCK_NEW_STATUS);
      shipmentRepository.updateStatus.mockResolvedValue(undefined); // updateStatus doesn't return a value

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        newStatusId: MOCK_NEW_STATUS_ID,
      };

      // Act: Execute the use case.
      await updateShipmentStatus.execute(request);

      // Assert: Verify that the correct repository methods were called.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID
      );

      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledWith(
        MOCK_NEW_STATUS_ID
      );

      expect(shipmentRepository.updateStatus).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.updateStatus).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID,
        MOCK_NEW_STATUS_ID
      );
    });

    it("should do nothing if the new status is the same as the current status", async () => {
      // Arrange: Configure mocks for the scenario where the status is already the same.
      const shipmentWithSameStatus: Shipment = {
        ...MOCK_SHIPMENT,
        currentStatusId: MOCK_NEW_STATUS_ID, // Current status is the same as the new one
      };

      shipmentRepository.findById.mockResolvedValue(shipmentWithSameStatus);
      shipmentStatusRepository.findById.mockResolvedValue(MOCK_NEW_STATUS); // The new status exists

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        newStatusId: MOCK_NEW_STATUS_ID,
      };

      // Act: Execute the use case.
      await updateShipmentStatus.execute(request);

      // Assert: Verify that initial checks were made, but no update occurred.
      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID
      );

      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledWith(
        MOCK_NEW_STATUS_ID
      );

      // IMPORTANT: `updateStatus` should NOT have been called.
      expect(shipmentRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe("execute - error scenarios", () => {
    it("should throw NotFoundError if the shipment is not found", async () => {
      // Arrange: Simulate `findById` returning null for the shipment.
      shipmentRepository.findById.mockResolvedValue(null);

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_NON_EXISTENT_ID,
        newStatusId: MOCK_NEW_STATUS_ID,
      };

      // Act & Assert: Expect `NotFoundError` to be thrown.
      await expect(updateShipmentStatus.execute(request)).rejects.toThrow(
        NotFoundError
      );

      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        MOCK_NON_EXISTENT_ID
      );

      expect(shipmentStatusRepository.findById).not.toHaveBeenCalled(); // Should not attempt to find the status
      expect(shipmentRepository.updateStatus).not.toHaveBeenCalled(); // Should not attempt to update
    });

    it("should throw NotFoundError if the new status is not found", async () => {
      // Arrange: Shipment is found, but the new status is not.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusRepository.findById.mockResolvedValue(null);

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        newStatusId: MOCK_NON_EXISTENT_ID,
      };

      // Act & Assert: Expect `NotFoundError` to be thrown.
      await expect(updateShipmentStatus.execute(request)).rejects.toThrow(
        NotFoundError
      );

      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.findById).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID
      );
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledWith(
        MOCK_NON_EXISTENT_ID
      );
      expect(shipmentRepository.updateStatus).not.toHaveBeenCalled(); // Should not attempt to update
    });

    it("should throw an error if shipmentRepository.findById fails", async () => {
      const mockError = new Error("Database connection error");
      // Arrange: Simulate `findById` for shipment throwing an error.

      shipmentRepository.findById.mockRejectedValue(mockError);

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        newStatusId: MOCK_NEW_STATUS_ID,
      };

      // Act & Assert: Expect the underlying error to be re-thrown.
      await expect(updateShipmentStatus.execute(request)).rejects.toThrow(
        mockError
      );

      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).not.toHaveBeenCalled();
      expect(shipmentRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw an error if shipmentStatusRepository.findById fails", async () => {
      const mockError = new Error("Status DB error");

      // Arrange: Shipment found, but `findById` for status throws an error.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusRepository.findById.mockRejectedValue(mockError);

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        newStatusId: MOCK_NEW_STATUS_ID,
      };

      // Act & Assert: Expect the underlying error to be re-thrown.
      await expect(updateShipmentStatus.execute(request)).rejects.toThrow(
        mockError
      );

      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw an error if shipmentRepository.updateStatus fails", async () => {
      const mockError = new Error("Update DB error");

      // Arrange: Shipment and new status found, but `updateStatus` fails.
      shipmentRepository.findById.mockResolvedValue(MOCK_SHIPMENT);
      shipmentStatusRepository.findById.mockResolvedValue(MOCK_NEW_STATUS);
      shipmentRepository.updateStatus.mockRejectedValue(mockError);

      const request: UpdateShipmentStatusRequest = {
        shipmentId: MOCK_SHIPMENT_ID,
        newStatusId: MOCK_NEW_STATUS_ID,
      };

      // Act & Assert: Expect the underlying error to be re-thrown.
      await expect(updateShipmentStatus.execute(request)).rejects.toThrow(
        mockError
      );

      expect(shipmentRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentStatusRepository.findById).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.updateStatus).toHaveBeenCalledTimes(1);
      expect(shipmentRepository.updateStatus).toHaveBeenCalledWith(
        MOCK_SHIPMENT_ID,
        MOCK_NEW_STATUS_ID
      );
    });
  });
});
