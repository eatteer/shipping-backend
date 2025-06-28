import { NotFoundError } from "@domain/errors/not-found-error";
import { SameOriginDestinationCityError } from "@domain/errors/same-origin-destination-city-error";
import { CityRepository } from "@domain/repositories/city-repository";
import { RateRepository } from "@domain/repositories/rate-repository";

export interface QuoteShipmentRequest {
  originCityId: string;
  destinationCityId: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
}

export interface QuoteShipmentResponse {
  originCityId: string;
  destinationCityId: string;
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

  constructor(
    private readonly cityRepository: CityRepository,
    private readonly rateRepository: RateRepository
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

    return {
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
  }
}
