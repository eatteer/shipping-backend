import { Rate } from "@domain/entities/rate";

export interface RateRepository {
  findByZoneIds(
    originZoneId: string,
    destinationZoneId: string
  ): Promise<Rate | null>;
}
