import {
  QuoteShipment,
  QuoteShipmentRequest,
  QuoteShipmentResponse,
} from "@application/use-cases/shipments/quote-shipment";
import { CacheService } from "@application/services/cache-service";
import { City } from "@domain/entities/city";
import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { RateRepository } from "@domain/repositories/rate-repository";

// Mock console.warn and console.log to prevent test output noise.
const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("QuoteShipment", () => {
  let cityRepository: jest.Mocked<CityRepository>;
  let rateRepository: jest.Mocked<RateRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let quoteShipment: QuoteShipment;

  // Common test data
  const MOCK_ORIGIN_CITY_ID = "city-origin-1";
  const MOCK_DESTINATION_CITY_ID = "city-destination-2";
  const MOCK_ORIGIN_CITY_NAME = "Pereira";
  const MOCK_DESTINATION_CITY_NAME = "Bogota";
  const MOCK_ORIGIN_ZONE_ID = "zone-A";
  const MOCK_DESTINATION_ZONE_ID = "zone-B";
  const MOCK_PACKAGE_WEIGHT_KG = 5;
  const MOCK_PACKAGE_LENGTH_CM = 30;
  const MOCK_PACKAGE_WIDTH_CM = 20;
  const MOCK_PACKAGE_HEIGHT_CM = 15;
  const MOCK_RATE_PRICE_PER_KG = 10000; // COP per Kg

  const MOCK_ORIGIN_CITY: City = new City({
    id: MOCK_ORIGIN_CITY_ID,
    name: MOCK_ORIGIN_CITY_NAME,
    departmentId: "dept-1",
    zoneId: MOCK_ORIGIN_ZONE_ID,
  });

  const MOCK_DESTINATION_CITY: City = new City({
    id: MOCK_DESTINATION_CITY_ID,
    name: MOCK_DESTINATION_CITY_NAME,
    departmentId: "dept-2",
    zoneId: MOCK_DESTINATION_ZONE_ID,
  });

  const MOCK_RATE = {
    id: "rate-1",
    originZoneId: MOCK_ORIGIN_ZONE_ID,
    destinationZoneId: MOCK_DESTINATION_ZONE_ID,
    pricePerKg: MOCK_RATE_PRICE_PER_KG,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_REQUEST: QuoteShipmentRequest = {
    originCityId: MOCK_ORIGIN_CITY_ID,
    destinationCityId: MOCK_DESTINATION_CITY_ID,
    packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
    packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
    packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
    packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
  };

  const MOCK_CACHE_KEY = `quote:${MOCK_ORIGIN_CITY_ID}:${MOCK_DESTINATION_CITY_ID}:${MOCK_PACKAGE_WEIGHT_KG}:${MOCK_PACKAGE_LENGTH_CM}:${MOCK_PACKAGE_WIDTH_CM}:${MOCK_PACKAGE_HEIGHT_CM}`;

  // Calculate expected values
  const EXPECTED_VOLUMETRIC_WEIGHT_KG_RAW =
    (MOCK_PACKAGE_LENGTH_CM * MOCK_PACKAGE_WIDTH_CM * MOCK_PACKAGE_HEIGHT_CM) /
    2500;
  const EXPECTED_VOLUMETRIC_WEIGHT_KG = Math.ceil(
    EXPECTED_VOLUMETRIC_WEIGHT_KG_RAW
  );
  const EXPECTED_CALCULATED_WEIGHT_KG = Math.max(
    MOCK_PACKAGE_WEIGHT_KG,
    EXPECTED_VOLUMETRIC_WEIGHT_KG
  );
  const EXPECTED_QUOTED_VALUE =
    EXPECTED_CALCULATED_WEIGHT_KG * MOCK_RATE_PRICE_PER_KG;

  beforeEach(() => {
    // Reset all mocks before each test to ensure isolation.
    jest.clearAllMocks();

    // Initialize repository and service mocks.
    cityRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    rateRepository = {
      findByZoneIds: jest.fn(),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    // Create a new instance of the use case for each test.
    quoteShipment = new QuoteShipment(
      cityRepository,
      rateRepository,
      cacheService
    );
  });

  afterAll(() => {
    // Restore console spies after all tests are complete.
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("execute - successful quote", () => {
    it("should calculate and return a shipment quote when not cached", async () => {
      // Configure mocks for a non-cached scenario.
      // The cache service returns null, indicating no cached value.
      cacheService.get.mockResolvedValue(null);

      // The city repository finds both origin and destination cities.
      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY)
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY);

      // The rate repository finds a rate for the given zones.
      rateRepository.findByZoneIds.mockResolvedValue(MOCK_RATE);

      // The cache service successfully stores the new quote.
      cacheService.set.mockResolvedValue(undefined);

      // Execute the use case.
      const result = await quoteShipment.execute(MOCK_REQUEST);

      // Assertions:
      // Verify `cacheService.get` was called once for the specific cache key.
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cacheService.get).toHaveBeenCalledWith(MOCK_CACHE_KEY);

      // Verify `cityRepository.findById` was called twice, once for each city.
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(cityRepository.findById).toHaveBeenCalledWith(MOCK_ORIGIN_CITY_ID);
      expect(cityRepository.findById).toHaveBeenCalledWith(
        MOCK_DESTINATION_CITY_ID
      );

      // Verify `rateRepository.findByZoneIds` was called once with the correct zone IDs.
      expect(rateRepository.findByZoneIds).toHaveBeenCalledTimes(1);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledWith(
        MOCK_ORIGIN_ZONE_ID,
        MOCK_DESTINATION_ZONE_ID
      );

      // Verify `cacheService.set` was called once to store the new quote.
      expect(cacheService.set).toHaveBeenCalledTimes(1);
      expect(cacheService.set).toHaveBeenCalledWith(
        MOCK_CACHE_KEY,
        JSON.stringify({
          originCityId: MOCK_ORIGIN_CITY_ID,
          destinationCityId: MOCK_DESTINATION_CITY_ID,
          originCityName: MOCK_ORIGIN_CITY_NAME,
          destinationCityName: MOCK_DESTINATION_CITY_NAME,
          packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
          packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
          packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
          packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
          calculatedWeightKg: EXPECTED_CALCULATED_WEIGHT_KG,
          quotedValue: EXPECTED_QUOTED_VALUE,
        }),
        3600 // CACHE_TTL_SECONDS
      );

      // Verify the returned quote matches the expected calculated values.
      expect(result).toEqual({
        originCityId: MOCK_ORIGIN_CITY_ID,
        destinationCityId: MOCK_DESTINATION_CITY_ID,
        originCityName: MOCK_ORIGIN_CITY_NAME,
        destinationCityName: MOCK_DESTINATION_CITY_NAME,
        packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
        packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
        packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
        packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
        calculatedWeightKg: EXPECTED_CALCULATED_WEIGHT_KG,
        quotedValue: EXPECTED_QUOTED_VALUE,
      });
    });

    it("should return a cached shipment quote if available", async () => {
      // Define a mock cached response.
      const MOCK_CACHED_RESPONSE: QuoteShipmentResponse = {
        originCityId: MOCK_ORIGIN_CITY_ID,
        destinationCityId: MOCK_DESTINATION_CITY_ID,
        originCityName: MOCK_ORIGIN_CITY_NAME,
        destinationCityName: MOCK_DESTINATION_CITY_NAME,
        packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
        packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
        packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
        packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
        calculatedWeightKg: EXPECTED_CALCULATED_WEIGHT_KG,
        quotedValue: EXPECTED_QUOTED_VALUE,
      };

      // Configure `cacheService.get` to return the cached value.
      cacheService.get.mockResolvedValue(JSON.stringify(MOCK_CACHED_RESPONSE));

      // Execute the use case.
      const result = await quoteShipment.execute(MOCK_REQUEST);

      // Assertions:
      // Verify `cacheService.get` was called once.
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cacheService.get).toHaveBeenCalledWith(MOCK_CACHE_KEY);

      // Ensure no repository or `cacheService.set` calls were made, as the quote came from cache.
      expect(cityRepository.findById).not.toHaveBeenCalled();
      expect(rateRepository.findByZoneIds).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();

      // Verify the returned result matches the cached response.
      expect(result).toEqual(MOCK_CACHED_RESPONSE);
    });

    it("should still calculate and return quote if cacheService.get fails", async () => {
      const mockCacheError = new Error("Cache connection error");

      // Simulate `cacheService.get` failure.
      cacheService.get.mockRejectedValue(mockCacheError);

      // Configure repository mocks for successful data retrieval.
      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY)
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY);

      rateRepository.findByZoneIds.mockResolvedValue(MOCK_RATE);

      // `cacheService.set` should still be called later.
      cacheService.set.mockResolvedValue(undefined);

      // Execute the use case.
      const result = await quoteShipment.execute(MOCK_REQUEST);

      // Assertions:
      // Verify `cacheService.get` was called and then a warning was logged.
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cacheService.get).toHaveBeenCalledWith(MOCK_CACHE_KEY);

      // Verify that business logic (city and rate lookups) still executed.
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledTimes(1);
      // Verify `cacheService.set` was attempted despite the `get` failure.
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      // Verify the returned quote is correct, calculated without cache.
      expect(result).toEqual({
        originCityId: MOCK_ORIGIN_CITY_ID,
        destinationCityId: MOCK_DESTINATION_CITY_ID,
        originCityName: MOCK_ORIGIN_CITY_NAME,
        destinationCityName: MOCK_DESTINATION_CITY_NAME,
        packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
        packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
        packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
        packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
        calculatedWeightKg: EXPECTED_CALCULATED_WEIGHT_KG,
        quotedValue: EXPECTED_QUOTED_VALUE,
      });
    });

    it("should still return quote if cacheService.set fails", async () => {
      const mockCacheError = new Error("Cache save error");

      // `cacheService.get` returns null (not cached).
      cacheService.get.mockResolvedValue(null);

      // City and rate lookups succeed.
      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY)
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY);
      rateRepository.findByZoneIds.mockResolvedValue(MOCK_RATE);

      // Simulate `cacheService.set` failure.
      cacheService.set.mockRejectedValue(mockCacheError);

      // Execute the use case.
      const result = await quoteShipment.execute(MOCK_REQUEST);

      // Assertions:
      // Verify `cacheService.get` was called, and then the core logic.
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledTimes(1);

      // Verify `cacheService.set` was called and a warning was logged.
      expect(cacheService.set).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[QuoteShipment] Error attempting to store in cache"
        ),
        mockCacheError
      );

      // Verify the returned quote is correct, as the cache failure shouldn't prevent returning the quote.
      expect(result).toEqual({
        originCityId: MOCK_ORIGIN_CITY_ID,
        destinationCityId: MOCK_DESTINATION_CITY_ID,
        originCityName: MOCK_ORIGIN_CITY_NAME,
        destinationCityName: MOCK_DESTINATION_CITY_NAME,
        packageWeightKg: MOCK_PACKAGE_WEIGHT_KG,
        packageLengthCm: MOCK_PACKAGE_LENGTH_CM,
        packageWidthCm: MOCK_PACKAGE_WIDTH_CM,
        packageHeightCm: MOCK_PACKAGE_HEIGHT_CM,
        calculatedWeightKg: EXPECTED_CALCULATED_WEIGHT_KG,
        quotedValue: EXPECTED_QUOTED_VALUE,
      });
    });
  });

  describe("execute - error scenarios", () => {
    it("should throw SameOriginDestinationCityError if origin and destination cities are the same", async () => {
      // Create a request where origin and destination city IDs are identical.
      const requestWithSameCities: QuoteShipmentRequest = {
        ...MOCK_REQUEST,
        destinationCityId: MOCK_ORIGIN_CITY_ID,
      };

      // Expect the use case to reject with `SameOriginDestinationCityError`.
      await expect(
        quoteShipment.execute(requestWithSameCities)
      ).rejects.toThrow(SameOriginDestinationCityError);

      // Assertions:
      // Ensure no external service calls were made, as validation should prevent them.
      expect(cacheService.get).not.toHaveBeenCalled();
      expect(cityRepository.findById).not.toHaveBeenCalled();
      expect(rateRepository.findByZoneIds).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if origin city is not found", async () => {
      // No cache hit.
      cacheService.get.mockResolvedValue(null);

      // Simulate `cityRepository.findById` returning null for the origin city.
      cityRepository.findById.mockResolvedValueOnce(null);
      cityRepository.findById.mockResolvedValueOnce(MOCK_DESTINATION_CITY); // Destination lookup won't occur.

      // Expect the use case to reject with `NotFoundError`.
      await expect(quoteShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        NotFoundError
      );

      // Assertions:
      // Verify only the origin city lookup was attempted.
      expect(cityRepository.findById).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledWith(MOCK_ORIGIN_CITY_ID);

      // Ensure subsequent operations were not performed.
      expect(rateRepository.findByZoneIds).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if destination city is not found", async () => {
      // No cache hit.
      cacheService.get.mockResolvedValue(null);
      // Origin city is found, but destination city is not.
      cityRepository.findById.mockResolvedValueOnce(MOCK_ORIGIN_CITY);
      cityRepository.findById.mockResolvedValueOnce(null);

      // Expect the use case to reject with `NotFoundError`.
      await expect(quoteShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        NotFoundError
      );

      // Assertions:
      // Both `findById` calls for cities should have occurred.
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(cityRepository.findById).toHaveBeenCalledWith(MOCK_ORIGIN_CITY_ID);
      expect(cityRepository.findById).toHaveBeenCalledWith(
        MOCK_DESTINATION_CITY_ID
      );

      // Ensure rate lookup and caching were not performed.
      expect(rateRepository.findByZoneIds).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if shipping rate is not found", async () => {
      // No cache hit.
      cacheService.get.mockResolvedValue(null);

      // Both cities are found.
      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY)
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY);

      // Simulate `rateRepository.findByZoneIds` returning null.
      rateRepository.findByZoneIds.mockResolvedValue(null);

      // Expect the use case to reject with `NotFoundError`.
      await expect(quoteShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        NotFoundError
      );

      // Assertions:
      // Verify city lookups and rate lookup occurred.
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledTimes(1);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledWith(
        MOCK_ORIGIN_ZONE_ID,
        MOCK_DESTINATION_ZONE_ID
      );

      // Ensure caching was not performed.
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it("should throw an error if cityRepository.findById fails for origin", async () => {
      const mockError = new Error("City DB error");
      // No cache hit.
      cacheService.get.mockResolvedValue(null);

      // Simulate `cityRepository.findById` for origin rejecting.
      cityRepository.findById.mockRejectedValueOnce(mockError);

      // Expect the use case to re-throw the underlying error.
      await expect(quoteShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify only the origin city lookup was attempted and failed.
      expect(cityRepository.findById).toHaveBeenCalledTimes(1);
      expect(cityRepository.findById).toHaveBeenCalledWith(MOCK_ORIGIN_CITY_ID);

      // Ensure no further operations.
      expect(rateRepository.findByZoneIds).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it("should throw an error if cityRepository.findById fails for destination", async () => {
      const mockError = new Error("City DB error");

      // No cache hit.
      cacheService.get.mockResolvedValue(null);

      // Origin city found, but `cityRepository.findById` for destination rejects.
      cityRepository.findById.mockResolvedValueOnce(MOCK_ORIGIN_CITY);
      cityRepository.findById.mockRejectedValueOnce(mockError);

      // Expect the use case to re-throw the underlying error.
      await expect(quoteShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify both city lookups were attempted, with the second one failing.
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(cityRepository.findById).toHaveBeenCalledWith(
        MOCK_DESTINATION_CITY_ID
      );

      // Ensure no further operations.
      expect(rateRepository.findByZoneIds).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it("should throw an error if rateRepository.findByZoneIds fails", async () => {
      const mockError = new Error("Rate DB error");

      // No cache hit.
      cacheService.get.mockResolvedValue(null);

      // Both cities found.
      cityRepository.findById
        .mockResolvedValueOnce(MOCK_ORIGIN_CITY)
        .mockResolvedValueOnce(MOCK_DESTINATION_CITY);

      // Simulate `rateRepository.findByZoneIds` rejecting.
      rateRepository.findByZoneIds.mockRejectedValue(mockError);

      // Expect the use case to re-throw the underlying error.
      await expect(quoteShipment.execute(MOCK_REQUEST)).rejects.toThrow(
        mockError
      );

      // Assertions:
      // Verify city lookups and rate lookup occurred and failed.
      expect(cityRepository.findById).toHaveBeenCalledTimes(2);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledTimes(1);
      expect(rateRepository.findByZoneIds).toHaveBeenCalledWith(
        MOCK_ORIGIN_ZONE_ID,
        MOCK_DESTINATION_ZONE_ID
      );

      // Ensure caching was not performed.
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
});
