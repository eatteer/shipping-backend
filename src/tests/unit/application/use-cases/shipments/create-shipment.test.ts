import {
  CreateShipment,
  CreateShipmentRequest,
  CreateShipmentResponse,
} from "@application/use-cases/shipments/create-shipment";
import {
  QuoteShipment,
  QuoteShipmentResponse,
} from "@application/use-cases/shipments/quote-shipment";
import { Shipment } from "@domain/entities/shipment";
import { User } from "@domain/entities/user";
import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { UserRepository } from "@domain/repositories/user-repository";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";

// Mock the Shipment class globally to control its instantiation and ID generation.
// This allows us to predict and assert the ID of the created shipment.
jest.mock("@domain/entities/shipment", () => {
  const actualShipment = jest.requireActual("@domain/entities/shipment");
  return {
    Shipment: jest.fn().mockImplementation((props) => {
      // Return an object that simulates a Shipment instance.
      // It includes properties from the actual constructor call and assigns a predictable mock ID.
      return {
        ...new actualShipment.Shipment(props),
        id:
          props.id ||
          "mock-shipment-id-" + Math.random().toString(36).substr(2, 9), // Generate a unique ID for each mock instance
      };
    }),
  };
});

describe("CreateShipment", () => {
  let shipmentRepository: jest.Mocked<ShipmentRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let quoteShipment: jest.Mocked<QuoteShipment>;
  let createShipment: CreateShipment;

  // Common test data
  const MOCK_USER_ID = "user-123";
  const MOCK_ORIGIN_CITY_ID = "city-A";
  const MOCK_DESTINATION_CITY_ID = "city-B";
  const MOCK_PACKAGE_WEIGHT_KG = 10;
  const MOCK_PACKAGE_LENGTH_CM = 50;
  const MOCK_PACKAGE_WIDTH_CM = 40;
  const MOCK_PACKAGE_HEIGHT_CM = 30;

  const MOCK_REQUEST: CreateShipmentRequest = {
    userId: MOCK_USER_ID,
    originCityId: MOCK_ORIGIN_CITY_ID,
    destinationCityId: MOCK_DESTINATION_CITY_ID,
    packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
    packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
    packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
    packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
  };

  const MOCK_USER: User = {
    id: MOCK_USER_ID,
    email: "test@user.com",
    passwordHash: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_QUOTE_RESPONSE: QuoteShipmentResponse = {
    originCityId: MOCK_ORIGIN_CITY_ID,
    destinationCityId: MOCK_DESTINATION_CITY_ID,
    originCityName: "Origin",
    destinationCityName: "Destination",
    packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
    packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
    packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
    packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
    calculatedWeightKg: 15,
    quotedValue: 150000,
  };

  beforeEach(() => {
    // Clear all mock calls and reset their behavior before each test to ensure isolation.
    jest.clearAllMocks();

    // Initialize mocks for external dependencies (repositories and other use cases).
    shipmentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    // Mock the `execute` method of the `QuoteShipment` use case.
    quoteShipment = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<QuoteShipment>;

    // Create a new instance of the `CreateShipment` use case with the mocked dependencies.
    createShipment = new CreateShipment(
      shipmentRepository,
      userRepository,
      quoteShipment
    );
  });

  describe("execute - successful shipment creation", () => {
    it("should create a shipment successfully and return its ID", async () => {
      // Set up mocks for a successful scenario.
      // The user repository will find the user.
      userRepository.findById.mockResolvedValue(MOCK_USER);

      // The `QuoteShipment` use case will return a successful quote response.
      quoteShipment.execute.mockResolvedValue(MOCK_QUOTE_RESPONSE);

      // The shipment repository's save method will complete without error.
      shipmentRepository.save.mockResolvedValue(undefined);

      // Execute the use case with the mock request.
      const result: CreateShipmentResponse = await createShipment.execute(
        MOCK_REQUEST
      );

      // Assertions:
      // Verify that the user repository's `findById` was called once with the correct user ID.
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(MOCK_USER_ID);

      // Verify that `QuoteShipment.execute` was called once with the correct package and city details.
      expect(quoteShipment.execute).toHaveBeenCalledTimes(1);
      expect(quoteShipment.execute).toHaveBeenCalledWith({
        originCityId: MOCK_REQUEST.originCityId,
        destinationCityId: MOCK_REQUEST.destinationCityId,
        packageWeightKg: MOCK_REQUEST.packageWeightKg,
        packageLengthCm: MOCK_REQUEST.packageLengthCm,
        packageWidthCm: MOCK_REQUEST.packageWidthCm,
        packageHeightCm: MOCK_REQUEST.packageHeightCm,
      });

      // Verify that the `Shipment` class constructor was called once.
      expect(Shipment).toHaveBeenCalledTimes(1);

      // Ensure the `Shipment` instance was created with the correct data, combining request details and quote response.
      expect(Shipment).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: MOCK_USER.id,
          originCityId: MOCK_REQUEST.originCityId,
          destinationCityId: MOCK_REQUEST.destinationCityId,
          packageWeightKg: MOCK_REQUEST.packageWeightKg,
          packageLengthCm: MOCK_REQUEST.packageLengthCm,
          packageWidthCm: MOCK_REQUEST.packageWidthCm,
          packageHeightCm: MOCK_REQUEST.packageHeightCm,
          calculatedWeightKg: MOCK_QUOTE_RESPONSE.calculatedWeightKg,
          quotedValue: MOCK_QUOTE_RESPONSE.quotedValue,
        })
      );

      // Verify that the shipment repository's `save` method was called once.
      expect(shipmentRepository.save).toHaveBeenCalledTimes(1);

      // Capture the `Shipment` instance that was passed to the `save` method.
      const shipmentPassedToSave = shipmentRepository.save.mock.calls[0][0];

      // Verify that the use case returns an object with the ID of the newly created (mocked) shipment.
      expect(result).toEqual({ shipmentId: shipmentPassedToSave.id });
    });
  });

  describe("execute - error scenarios", () => {
    it("should throw NotFoundError if the user is not found", async () => {
      // Configure the user repository to return null, simulating a user not found.
      userRepository.findById.mockResolvedValue(null);

      // Expect the use case to reject with a `NotFoundError`.
      await expect(createShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        NotFoundError
      );
      // Verify the specific error message.

      // Assertions:
      // Confirm `findById` was called to check for the user.
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userRepository.findById).toHaveBeenCalledWith(MOCK_USER_ID);

      // Ensure `QuoteShipment.execute` and `shipmentRepository.save` were not called,
      // as the process should halt early due to the missing user.
      expect(quoteShipment.execute).not.toHaveBeenCalled();
      expect(shipmentRepository.save).not.toHaveBeenCalled();
    });

    it("should re-throw NotFoundError if quoteShipment throws NotFoundError (e.g., city not found)", async () => {
      // User is found, but the `QuoteShipment` use case will fail with a `NotFoundError`.
      userRepository.findById.mockResolvedValue(MOCK_USER);

      const quoteNotFoundError = new NotFoundError("Origin city not found");
      quoteShipment.execute.mockRejectedValue(quoteNotFoundError);

      // Expect the `CreateShipment` use case to re-throw the `NotFoundError` from `QuoteShipment`.
      await expect(createShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        quoteNotFoundError
      );

      // Assertions:
      // Verify `userRepository.findById` was called.
      expect(userRepository.findById).toHaveBeenCalledTimes(1);

      // Verify `quoteShipment.execute` was called but failed.
      expect(quoteShipment.execute).toHaveBeenCalledTimes(1);

      // Ensure `shipmentRepository.save` was not called.
      expect(shipmentRepository.save).not.toHaveBeenCalled();
    });

    it("should re-throw SameOriginDestinationCityError if quoteShipment throws it", async () => {
      // User is found, but `QuoteShipment` will fail with a `SameOriginDestinationCityError`.
      userRepository.findById.mockResolvedValue(MOCK_USER);

      const sameCityError = new SameOriginDestinationCityError();
      quoteShipment.execute.mockRejectedValue(sameCityError);

      // Expect the `CreateShipment` use case to re-throw this specific error.
      await expect(createShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        sameCityError
      );

      // Assertions:
      // Verify `userRepository.findById` was called.
      expect(userRepository.findById).toHaveBeenCalledTimes(1);

      // Verify `quoteShipment.execute` was called.
      expect(quoteShipment.execute).toHaveBeenCalledTimes(1);

      // Ensure `shipmentRepository.save` was not called.
      expect(shipmentRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if shipmentRepository.save fails", async () => {
      const mockSaveError = new Error("Database save failed");

      // Mocks for successful user lookup and quoting.
      userRepository.findById.mockResolvedValue(MOCK_USER);
      quoteShipment.execute.mockResolvedValue(MOCK_QUOTE_RESPONSE);

      // Configure `shipmentRepository.save` to reject, simulating a database write error.
      shipmentRepository.save.mockRejectedValue(mockSaveError);

      // Expect the `CreateShipment` use case to re-throw the database error.
      await expect(createShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        mockSaveError
      );

      // Assertions:
      // Verify all preceding steps were called as expected.
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(quoteShipment.execute).toHaveBeenCalledTimes(1);

      // Verify that the `Shipment` instance was created before the save attempt.
      expect(Shipment).toHaveBeenCalledTimes(1);

      // Verify that `shipmentRepository.save` was indeed called, even though it failed.
      expect(shipmentRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should throw a general error if userRepository.findById fails", async () => {
      const mockUserRepoError = new Error("User DB connection error");

      // Configure `userRepository.findById` to reject, simulating a failure at the very first step.
      userRepository.findById.mockRejectedValue(mockUserRepoError);

      // Expect the `CreateShipment` use case to re-throw the general repository error.
      await expect(createShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        mockUserRepoError
      );

      // Assertions:
      // Verify `userRepository.findById` was called.
      expect(userRepository.findById).toHaveBeenCalledTimes(1);

      // Ensure no subsequent services were called.
      expect(quoteShipment.execute).not.toHaveBeenCalled();
      expect(shipmentRepository.save).not.toHaveBeenCalled();
    });
  });
});
