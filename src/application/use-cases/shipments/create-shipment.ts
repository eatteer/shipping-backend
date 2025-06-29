import { QuoteShipment } from "@application/use-cases/shipments/quote-shipment";
import { Shipment } from "@domain/entities/shipment";
import { NotFoundError } from "@domain/errors/not-found-error";
import { ShipmentRepository } from "@domain/repositories/shipment-repository";
import { UserRepository } from "@domain/repositories/user-repository";

/**
 * Request data for shipment creation.
 * 
 * Contains the essential information required to create a new shipment
 * including user identification and package details.
 * 
 * @since 1.0.0
 */
export type CreateShipmentRequest = {
  /** Unique identifier of the user creating the shipment */
  userId: string;
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
 * Response data for successful shipment creation.
 * 
 * Contains the unique identifier of the newly created shipment.
 * 
 * @since 1.0.0
 */
export type CreateShipmentResponse = {
  /** Unique identifier of the created shipment */
  shipmentId: string;
};

/**
 * Use case for shipment creation.
 * 
 * This use case handles the business logic for creating new shipments.
 * It validates the user exists, calculates shipping costs, creates the
 * shipment entity, and persists it to the database.
 * 
 * @since 1.0.0
 */
export class CreateShipment {
  /**
   * Creates a new CreateShipment use case instance.
   * 
   * @param shipmentRepository - Repository for shipment data operations
   * @param userRepository - Repository for user data operations
   * @param quoteShipment - Use case for calculating shipment quotes
   */
  public constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly userRepository: UserRepository,
    private readonly quoteShipment: QuoteShipment
  ) { }

  /**
   * Executes the shipment creation process.
   * 
   * Performs the complete shipment creation workflow:
   * 1. Validates that the requesting user exists
   * 2. Calculates shipping costs using the quote use case
   * 3. Creates a new Shipment entity with calculated values
   * 4. Persists the shipment to the database
   * 5. Returns the shipment ID for tracking
   * 
   * @param request - Shipment creation data containing user and package details
   * 
   * @example
   * ```typescript
   * const createShipment = new CreateShipment(
   *   shipmentRepository,
   *   userRepository,
   *   quoteShipment
   * );
   * 
   * const response = await createShipment.execute({
   *   userId: "user-123",
   *   originCityId: "city-123",
   *   destinationCityId: "city-456",
   *   packageWeightKg: 5.5,
   *   packageLengthCm: 30,
   *   packageWidthCm: 20,
   *   packageHeightCm: 15
   * });
   * 
   * console.log(response.shipmentId); // New shipment ID
   * ```
   * 
   * @throws {NotFoundError} When the requesting user is not found
   * @throws {SameOriginDestinationCityError} When origin and destination cities are identical
   * @throws {NotFoundError} When origin or destination city is not found
   * @throws {NotFoundError} When shipping rate is not found for the route
   * @throws {Error} When database operations fail
   * 
   * @returns Promise that resolves to the creation response containing the shipment ID
   * 
   * @since 1.0.0
   */
  public async execute(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const {
      userId,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request;

    // 1. Validate if the requesting user exists
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // 2. Obtain the shipment quote
    const { calculatedWeightKg, quotedValue } =
      await this.quoteShipment.execute({
        originCityId,
        destinationCityId,
        packageWeightKg,
        packageHeightCm,
        packageWidthCm,
        packageLengthCm,
      });

    // 3. Create a new Shipment
    const shipment = new Shipment({
      userId: user.id,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
      calculatedWeightKg,
      quotedValue,
    });

    // 4. Persist the new shipment
    await this.shipmentRepository.save(shipment);

    // 5. Return the ID
    return {
      shipmentId: shipment.id,
    };
  }
}
