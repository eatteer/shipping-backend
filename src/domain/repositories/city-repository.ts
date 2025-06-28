import { City } from "@domain/entities/city";

export interface CityRepository {
  findById(id: string): Promise<City | null>;
  findAll(): Promise<City[]>;
}
