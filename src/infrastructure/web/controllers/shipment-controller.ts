import { QuoteShipment } from "@src/application/use-cases/shipments/quote-shipment";
import { CreateShipment } from "@application/use-cases/shipments/create-shipment";
import { GetShipmentTrackingDetails } from "@application/use-cases/shipments/get-shipment-tracking-details";
import {
  CreateShipmentBody,
  GetShipmentTrackingParams,
  QuoteShipmentBody,
} from "@infrastructure/web/schemas/shipment-schemas";
import { FastifyReply, FastifyRequest } from "fastify";

/**
 * Controller responsible for handling shipment-related HTTP requests.
 * 
 * This controller provides endpoints for shipment operations including
 * quoting, creation, and tracking, delegating business logic to the
 * appropriate use cases.
 * 
 * @since 1.0.0
 */
export class ShipmentController {
  /**
   * Creates a new ShipmentController instance.
   * 
   * @param quoteShipment - Use case for generating shipment quotes
   * @param createShipment - Use case for creating new shipments
   * @param getShipmentTrackingDetails - Use case for retrieving tracking information
   */
  public constructor(
    private readonly quoteShipment: QuoteShipment,
    private readonly createShipment: CreateShipment,
    private readonly getShipmentTrackingDetails: GetShipmentTrackingDetails
  ) { }

  /**
   * Handles shipment quote requests.
   * 
   * Calculates shipping costs based on origin, destination, and package dimensions.
   * Returns a detailed quote with calculated weight and pricing.
   * 
   * @param request - Fastify request containing shipment details for quoting
   * @param reply - Fastify reply object for sending response
   * 
   * @example
   * ```typescript
   * // Request body
   * {
   *   "originCityId": "uuid",
   *   "destinationCityId": "uuid",
   *   "packageWeightKg": 5.5,
   *   "packageLengthCm": 30,
   *   "packageWidthCm": 20,
   *   "packageHeightCm": 15
   * }
   * 
   * // Success response (200)
   * {
   *   "originCityId": "uuid",
   *   "destinationCityId": "uuid",
   *   "packageWeightKg": 5.5,
   *   "calculatedWeightKg": 6.0,
   *   "quotedValue": 150.00
   * }
   * ```
   * 
   * @throws {SameOriginDestinationCityError} When origin and destination cities are the same
   * @throws {NotFoundError} When origin or destination city is not found
   * @throws {ValidationError} When the provided data is invalid
   * @throws {Error} When database operations or calculations fail
   * 
   * @returns Promise that resolves with the quote response
   * 
   * @since 1.0.0
   */
  public async quote(
    request: FastifyRequest<{ Body: QuoteShipmentBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const {
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageHeightCm,
      packageWidthCm,
      packageLengthCm,
    } = request.body;

    const response = await this.quoteShipment.execute({
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageHeightCm,
      packageWidthCm,
      packageLengthCm,
    });

    reply.code(200).send(response);
  }

  /**
   * Handles shipment creation requests.
   * 
   * Creates a new shipment with the provided details and associates it
   * with the authenticated user. The shipment is created with a calculated
   * quote based on the provided package information.
   * 
   * @param request - Fastify request containing shipment creation data
   * @param reply - Fastify reply object for sending response
   * 
   * @example
   * ```typescript
   * // Request body
   * {
   *   "originCityId": "uuid",
   *   "destinationCityId": "uuid",
   *   "packageWeightKg": 5.5,
   *   "packageLengthCm": 30,
   *   "packageWidthCm": 20,
   *   "packageHeightCm": 15
   * }
   * 
   * // Success response (201)
   * {
   *   "shipmentId": "uuid"
   * }
   * ```
   * 
   * @throws {SameOriginDestinationCityError} When origin and destination cities are the same
   * @throws {NotFoundError} When user, origin, or destination city is not found
   * @throws {ValidationError} When the provided data is invalid
   * @throws {Error} When database operations fail
   * 
   * @returns Promise that resolves with the creation response
   * 
   * @since 1.0.0
   */
  public async create(
    request: FastifyRequest<{ Body: CreateShipmentBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const {
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    } = request.body;

    const response = await this.createShipment.execute({
      userId: request.user.userId,
      originCityId,
      destinationCityId,
      packageWeightKg,
      packageLengthCm,
      packageWidthCm,
      packageHeightCm,
    });

    reply.code(201).send(response);
  }

  /**
   * Handles shipment tracking detail requests.
   * 
   * Retrieves detailed tracking information for a specific shipment,
   * including current status, history, and package details. Only
   * the shipment owner can access this information.
   * 
   * @param request - Fastify request containing shipment ID parameter
   * @param reply - Fastify reply object for sending response
   * 
   * @example
   * ```typescript
   * // URL parameter: /shipments/{id}/track
   * 
   * // Success response (200)
   * {
   *   "shipmentId": "uuid",
   *   "originCity": "New York",
   *   "destinationCity": "Los Angeles",
   *   "currentStatus": "In Transit",
   *   "trackingHistory": [
   *     {
   *       "statusName": "Picked Up",
   *       "timestamp": "2024-01-15T10:30:00Z"
   *     }
   *   ]
   * }
   * ```
   * 
   * @throws {NotFoundError} When shipment is not found
   * @throws {AuthorizationError} When user is not authorized to view this shipment
   * @throws {Error} When database operations fail
   * 
   * @returns Promise that resolves with the tracking details
   * 
   * @since 1.0.0
   */
  public async getTrackingDetails(
    request: FastifyRequest<{ Params: GetShipmentTrackingParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id: shipmentId } = request.params;

    const trackingDetails = await this.getShipmentTrackingDetails.execute({
      shipmentId,
      userId: request.user.userId,
    });

    reply.status(200).send(trackingDetails);
  }
}
