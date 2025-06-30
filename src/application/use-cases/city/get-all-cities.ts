import { City } from "@src/domain/entities/city";
import { CityRepository } from "@src/domain/repositories/city-repository";

/**
 * Use case for retrieving all cities.
 *
 * This use case handles the business logic for fetching all available cities from the repository.
 *
 * @since 1.0.0
 */
export class GetAllCities {
  /**
   * Creates a new GetAllCities use case instance.
   *
   * @param cityRepository - Repository for city data operations
   */
  public constructor(private readonly cityRepository: CityRepository) { }

  /**
   * Executes the process to retrieve all cities.
   *
   * Fetches all city entities from the repository and returns them as an array.
   *
   * @example
   * ```typescript
   * const getAllCities = new GetAllCities(cityRepository);
   * const cities = await getAllCities.execute();
   * console.log(cities); // Array of City entities
   * ```
   *
   * @returns Promise that resolves to an array of City entities
   *
   * @since 1.0.0
   */
  public async execute(): Promise<City[]> {
    const cities = await this.cityRepository.findAll();
    return cities;
  }
}
