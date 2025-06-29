// src/application/use-cases/quotes/quote-shipment.ts
import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { RateRepository } from "@domain/repositories/rate-repository";
import { FastifyRedis } from "@fastify/redis";

export interface QuoteShipmentRequest {
  originCityId: string; // Kept as string
  destinationCityId: string; // Kept as string
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
}

export interface QuoteShipmentResponse {
  originCityId: string; // Kept as string
  destinationCityId: string; // Kept as string
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  volumetricWeightKg: number;
  calculatedWeightKg: number;
  quotedValue: number;
}

export class QuoteShipment {
  private readonly volumetricFactor: number = 2500;
  // Define a TTL (Time To Live) for cache entries in seconds
  // For example, 3600 seconds = 1 hour. Adjust this value based on your rate volatility.
  private readonly CACHE_TTL_SECONDS = 3600;

  constructor(
    private readonly cityRepository: CityRepository,
    private readonly rateRepository: RateRepository,
    private readonly redis: FastifyRedis // Inject the Redis client here!
  ) {}

  async execute(request: QuoteShipmentRequest): Promise<QuoteShipmentResponse> {
    const {
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request;

    // --- 1. Generate a unique cache key ---
    // Ensure the order and format of parameters are consistent
    // so the key is always the same for the same quote request.
    const cacheKey = `quote:${originCityId}:${destinationCityId}:${packageWeightKg}:${packageLengthCm}:${packageWidthCm}:${packageHeightCm}`;

    try {
      // --- 2. Attempt to retrieve the quote from Redis cache ---
      const cachedResult = await this.redis.get(cacheKey);

      if (cachedResult) {
        // If found in cache, parse and return immediately
        const parsedResult: QuoteShipmentResponse = JSON.parse(cachedResult);
        console.log(
          `[QuoteShipment] Quote retrieved from cache for key: ${cacheKey}`
        );
        return parsedResult;
      }
    } catch (cacheError) {
      // If there's an error with Redis (e.g., Redis unavailable, network error), log it
      // but do not fail the main operation. Continue without using the cache.
      console.warn(
        `[QuoteShipment] Error attempting to get from Redis cache for ${cacheKey}:`,
        cacheError
      );
    }

    // --- 3. If not in cache, proceed with your existing business logic (DB lookup and calculation) ---

    const originCity = await this.cityRepository.findById(originCityId);
    const destinationCity = await this.cityRepository.findById(
      destinationCityId
    );

    if (!originCity) {
      throw new NotFoundError().setEntityName("Origin city");
    }

    if (!destinationCity) {
      throw new NotFoundError().setEntityName("Destination city");
    }

    if (originCity.id === destinationCity.id) {
      throw new SameOriginDestinationCityError();
    }

    const originZoneId = originCity.zoneId;
    const destinationZoneId = destinationCity.zoneId;

    const rate = await this.rateRepository.findByZoneIds(
      originZoneId,
      destinationZoneId
    );

    if (!rate) {
      throw new NotFoundError().setEntityName("Rate");
    }

    const volumetricWeightCm3 =
      packageLengthCm * packageWidthCm * packageHeightCm;

    const volumetricWeightKgRaw = volumetricWeightCm3 / this.volumetricFactor;

    const volumetricWeightKg = Math.ceil(volumetricWeightKgRaw);

    const calculatedWeightKg = Math.max(packageWeightKg, volumetricWeightKg);

    const quotedValue = calculatedWeightKg * rate.pricePerKg;

    const result: QuoteShipmentResponse = {
      originCityId: originCity.id,
      destinationCityId: destinationCity.id,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
      volumetricWeightKg,
      calculatedWeightKg,
      quotedValue: quotedValue,
    };

    // --- 4. Store the result in Redis before returning it ---
    try {
      // Save the result as a JSON string with a Time To Live (TTL)
      await this.redis.setex(
        cacheKey,
        this.CACHE_TTL_SECONDS,
        JSON.stringify(result)
      );
      console.log(
        `[QuoteShipment] Quote stored in cache for key: ${cacheKey} with TTL of ${this.CACHE_TTL_SECONDS} seconds.`
      );
    } catch (cacheError) {
      // If there's an error storing in cache, log it but do not prevent the quote from being returned
      console.warn(
        `[QuoteShipment] Error attempting to store in Redis cache for ${cacheKey}:`,
        cacheError
      );
    }

    return result;
  }
}
