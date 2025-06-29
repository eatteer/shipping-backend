import { CacheService } from "@application/services/cache-service";
import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { RateRepository } from "@domain/repositories/rate-repository";

export type QuoteShipmentRequest = {
  originCityId: string;
  destinationCityId: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
};

export type QuoteShipmentResponse = {
  originCityId: string;
  destinationCityId: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  calculatedWeightKg: number;
  quotedValue: number;
};

export class QuoteShipment {
  private readonly volumetricFactor: number = 2500;

  // (Time To Live)
  private readonly CACHE_TTL_SECONDS = 3600;

  public constructor(
    private readonly cityRepository: CityRepository,
    private readonly rateRepository: RateRepository,
    private readonly cacheService: CacheService
  ) {}

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
