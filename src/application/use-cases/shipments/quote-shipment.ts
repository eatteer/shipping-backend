import { CacheService } from "@application/services/cache-service";
import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { RateRepository } from "@domain/repositories/rate-repository";

/**
 * Request data for shipment quoting.
 * 
 * Contains the essential information required to calculate shipping costs
 * including origin, destination, and package dimensions.
 * 
 * @since 1.0.0
 */
export type QuoteShipmentRequest = {
  /** Unique identifier of the origin city */
  originCityId: string;
  /** Unique identifier of the destination city */
  destinationCityId: string;
  /** Weight of the package in kilograms */
  packageWeightKg: number;
  /** Length of the package in centimeters */
  packageLengthCm: number;
  /** Width of the package in centimeters */
  packageWidthCm: number;
  /** Height of the package in centimeters */
  packageHeightCm: number;
};

/**
 * Response data for shipment quote calculation.
 * 
 * Contains the calculated shipping costs and package details including
 * volumetric weight calculations and final quoted value.
 * 
 * @since 1.0.0
 */
export type QuoteShipmentResponse = {
  /** Unique identifier of the origin city */
  originCityId: string;
  /** Unique identifier of the destination city */
  destinationCityId: string;
  /** Weight of the package in kilograms */
  packageWeightKg: number;
  /** Length of the package in centimeters */
  packageLengthCm: number;
  /** Width of the package in centimeters */
  packageWidthCm: number;
  /** Height of the package in centimeters */
  packageHeightCm: number;
  /** Calculated weight (greater of actual or volumetric weight) in kilograms */
  calculatedWeightKg: number;
  /** Final quoted shipping cost */
  quotedValue: number;
};

/**
 * Use case for shipment quote calculation.
 * 
 * This use case handles the business logic for calculating shipping costs.
 * It validates cities, calculates volumetric weight, applies shipping rates,
 * and provides caching for performance optimization.
 * 
 * @since 1.0.0
 */
export class QuoteShipment {
  /** Volumetric factor for weight calculation (cm³ to kg conversion) */
  private readonly volumetricFactor: number = 2500;

  /** Cache TTL in seconds (1 hour) */
  private readonly CACHE_TTL_SECONDS = 3600;

  /**
   * Creates a new QuoteShipment use case instance.
   * 
   * @param cityRepository - Repository for city data operations
   * @param rateRepository - Repository for shipping rate data operations
   * @param cacheService - Service for caching quote results
   */
  public constructor(
    private readonly cityRepository: CityRepository,
    private readonly rateRepository: RateRepository,
    private readonly cacheService: CacheService
  ) { }

  /**
   * Executes the shipment quote calculation process.
   * 
   * Performs the complete quote calculation workflow:
   * 1. Validates that origin and destination cities are different
   * 2. Checks cache for existing quote results
   * 3. Validates that both cities exist
   * 4. Calculates volumetric and actual weight
   * 5. Applies shipping rates based on zones
   * 6. Caches the result for future requests
   * 
   * @param request - Shipment quote data containing cities and package dimensions
   * 
   * @example
   * ```typescript
   * const quoteShipment = new QuoteShipment(
   *   cityRepository,
   *   rateRepository,
   *   cacheService
   * );
   * 
   * const quote = await quoteShipment.execute({
   *   originCityId: "city-123",
   *   destinationCityId: "city-456",
   *   packageWeightKg: 5.5,
   *   packageLengthCm: 30,
   *   packageWidthCm: 20,
   *   packageHeightCm: 15
   * });
   * 
   * console.log(quote.quotedValue); // Final shipping cost
   * ```
   * 
   * @throws {SameOriginDestinationCityError} When origin and destination cities are identical
   * @throws {NotFoundError} When origin or destination city is not found
   * @throws {NotFoundError} When shipping rate is not found for the route
   * @throws {Error} When database operations or cache operations fail
   * 
   * @returns Promise that resolves to the calculated quote response
   * 
   * @since 1.0.0
   */
  public async execute(
    request: QuoteShipmentRequest
  ): Promise<QuoteShipmentResponse> {
    const {
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request;

    // Check for same origin and destination city ID before any DB search
    if (originCityId === destinationCityId) {
      throw new SameOriginDestinationCityError();
    }

    // 1. Generate a unique cache key for this specific quote request
    const cacheKey = `quote:${originCityId}:${destinationCityId}:${packageWeightKg}:${packageLengthCm}:${packageWidthCm}:${packageHeightCm}`;

    let result: QuoteShipmentResponse | null = null;

    try {
      // 2. Attempt to retrieve the quote from cache
      const cachedResult = await this.cacheService.get(cacheKey);

      if (cachedResult) {
        // If found in cache, parse and store in 'result' variable
        result = JSON.parse(cachedResult);

        console.log(
          `[QuoteShipment] Quote retrieved from cache for key: ${cacheKey}`
        );
      }
    } catch (cacheError) {
      console.warn(
        `[QuoteShipment] Error attempting to get from  cache for ${cacheKey}:`,
        cacheError
      );
    }

    // 3. If no result from cache, proceed with business logic (DB search and calculation)
    if (!result) {
      const originCity = await this.cityRepository.findById(originCityId);

      if (!originCity) {
        throw new NotFoundError("Origin city not found");
      }

      const destinationCity = await this.cityRepository.findById(
        destinationCityId
      );

      if (!destinationCity) {
        throw new NotFoundError("Destination city not found");
      }

      const originZoneId = originCity.zoneId;
      const destinationZoneId = destinationCity.zoneId;

      const rate = await this.rateRepository.findByZoneIds(
        originZoneId,
        destinationZoneId
      );

      // If no rate is found
      if (!rate) {
        throw new NotFoundError(
          "Shipping rate not found for the specified route"
        );
      }

      // Perform calculations
      const volumetricWeight =
        packageLengthCm * packageWidthCm * packageHeightCm;

      const volumetricWeightKgRaw = volumetricWeight / this.volumetricFactor;

      const volumetricWeightKg = Math.ceil(volumetricWeightKgRaw); // Round up volumetric weight

      const calculatedWeightKg = Math.max(packageWeightKg, volumetricWeightKg);

      const quotedValue = calculatedWeightKg * rate.pricePerKg;

      result = {
        originCityId: originCity.id,
        destinationCityId: destinationCity.id,
        packageWeightKg,
        packageLengthCm,
        packageWidthCm,
        packageHeightCm,
        calculatedWeightKg,
        quotedValue: quotedValue,
      };

      // 4. Store the newly calculated result in cache before returning it
      try {
        await this.cacheService.set(
          cacheKey,
          JSON.stringify(result),
          this.CACHE_TTL_SECONDS
        );

        console.log(
          `[QuoteShipment] Quote stored in cache for key: ${cacheKey} with TTL of ${this.CACHE_TTL_SECONDS} seconds`
        );
      } catch (cacheError) {
        console.warn(
          `[QuoteShipment] Error attempting to store in cache for ${cacheKey}:`,
          cacheError
        );
      }
    }

    return result;
  }
}
