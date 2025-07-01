import { GetAllCities } from "@application/use-cases/city/get-all-cities";
import { CityRepository } from "@domain/repositories/city-repository";
import { City } from "@domain/entities/city";

describe("GetAllCities", () => {
  let cityRepository: jest.Mocked<CityRepository>;
  let getAllCities: GetAllCities;

  // Common test data
  const MOCK_CITY_1: City = new City({
    id: "city-1",
    name: "Bogota",
    departmentId: "dept-1",
    zoneId: "zone-A",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const MOCK_CITY_2: City = new City({
    id: "city-2",
    name: "Medellin",
    departmentId: "dept-2",
    zoneId: "zone-B",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const MOCK_CITIES: City[] = [MOCK_CITY_1, MOCK_CITY_2];

  beforeEach(() => {
    // Initialize the repository mock before each test to ensure a clean state.
    cityRepository = {
      findById: jest.fn(),
      findAll: jest.fn(), // Only mock findAll as it's the sole dependency method used here.
      // If CityRepository had other methods like save or update, they would also be mocked here.
    };

    // Create a new instance of the use case for each test.
    getAllCities = new GetAllCities(cityRepository);
  });

  describe("execute - successful retrieval", () => {
    it("should return an array of all cities from the repository", async () => {
      // Configure the `findAll` mock to return a predefined list of cities.
      cityRepository.findAll.mockResolvedValue(MOCK_CITIES);

      // Execute the use case.
      const result: City[] = await getAllCities.execute();

      // Assertions:
      // Verify that the `findAll` method on the repository was called exactly once.
      expect(cityRepository.findAll).toHaveBeenCalledTimes(1);

      // Ensure the returned result matches the mock data exactly.
      expect(result).toEqual(MOCK_CITIES);

      // Confirm the array isn't empty, as we expect results in this scenario.
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no cities are found in the repository", async () => {
      // Configure the `findAll` mock to return an empty array, simulating no cities found.
      cityRepository.findAll.mockResolvedValue([]);

      // Execute the use case.
      const result: City[] = await getAllCities.execute();

      // Assertions:
      // Verify that `findAll` was still called once.
      expect(cityRepository.findAll).toHaveBeenCalledTimes(1);

      // Ensure the result is an empty array.
      expect(result).toEqual([]);

      // Confirm the array has zero length.
      expect(result.length).toBe(0);
    });
  });

  describe("execute - error handling", () => {
    it("should throw an error if the city repository fails", async () => {
      const mockError = new Error("Database connection lost");
      // Configure the `findAll` mock to reject, simulating a repository failure (e.g., database error).
      cityRepository.findAll.mockRejectedValue(mockError);

      // Expect the use case to re-throw the underlying error from the repository.
      await expect(getAllCities.execute()).rejects.toThrow(mockError);

      // Verify that `findAll` was indeed called before the error occurred.
      expect(cityRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
