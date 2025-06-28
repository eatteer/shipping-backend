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
      throw new Error(
        `Ciudad de origen con ID '${originCityId}' no encontrada.`
      );
    }

    if (!destinationCity) {
      throw new Error(
        `Ciudad de destino con ID '${destinationCityId}' no encontrada.`
      );
    }

    if (originCity.id === destinationCity.id) {
      throw new Error(
        "La ciudad de origen y la ciudad de destino no pueden ser la misma."
      );
    }

    const originZoneId = originCity.zoneId;
    const destinationZoneId = destinationCity.zoneId;

    const rate = await this.rateRepository.findByZoneIds(
      originZoneId,
      destinationZoneId
    );

    if (!rate) {
      throw new Error(
        `No se encontró una tarifa para la ruta de zona ${originZoneId} a zona ${destinationZoneId}.`
      );
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
