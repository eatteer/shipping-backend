import { Static, Type } from "@sinclair/typebox";
import {
  VALIDATION_ERROR_SCHEMA,
  NOT_FOUND_ERROR_SCHEMA,
  INTERNAL_SERVER_ERROR_SCHEMA,
} from "./common-schemas";

/**
 * Shipment-related schemas for quote, creation, and tracking operations.
 * These schemas define the structure of request and response data for shipment endpoints.
 */

/**
 * Request schemas for shipment operations.
 */

/**
 * Schema for shipment quote request body.
 * Defines the required fields for calculating shipping costs.
 *
 * @example
 * ```json
 * {
 *   "originCityId": "550e8400-e29b-41d4-a716-446655440000",
 *   "destinationCityId": "550e8400-e29b-41d4-a716-446655440001",
 *   "packageWeightKg": 5.5,
 *   "packageLengthCm": 30,
 *   "packageWidthCm": 20,
 *   "packageHeightCm": 15
 * }
 * ```
 */
export const QUOTE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

/**
 * Schema for shipment creation request body.
 * Defines the required fields for creating a new shipment.
 *
 * @example
 * ```json
 * {
 *   "originCityId": "550e8400-e29b-41d4-a716-446655440000",
 *   "destinationCityId": "550e8400-e29b-41d4-a716-446655440001",
 *   "packageWeightKg": 5.5,
 *   "packageLengthCm": 30,
 *   "packageWidthCm": 20,
 *   "packageHeightCm": 15
 * }
 * ```
 */
export const CREATE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

/**
 * Schema for shipment tracking request parameters.
 * Defines the URL parameter for retrieving tracking information.
 *
 * @example
 * ```json
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000"
 * }
 * ```
 */
export const GET_SHIPMENT_TRACKING_PARAMS_SCHEMA = Type.Object({
  id: Type.String({ format: "uuid" }),
});

/**
 * Response schemas for shipment operations.
 */

/**
 * Schema for shipment quote response.
 * Returns calculated shipping costs and package details.
 *
 * @example
 * ```json
 * {
 *   "originCityId": "550e8400-e29b-41d4-a716-446655440000",
 *   "destinationCityId": "550e8400-e29b-41d4-a716-446655440001",
 *   "packageWeightKg": 5.5,
 *   "packageLengthCm": 30,
 *   "packageWidthCm": 20,
 *   "packageHeightCm": 15,
 *   "calculatedWeightKg": 6.0,
 *   "quotedValue": 150.00
 * }
 * ```
 */
export const QUOTE_SHIPMENT_RESPONSE_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
  calculatedWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  quotedValue: Type.Number({ minimum: 1, maximum: 1000000 }),
});

/**
 * Schema for shipment creation response.
 * Returns the ID of the newly created shipment.
 *
 * @example
 * ```json
 * {
 *   "shipmentId": "550e8400-e29b-41d4-a716-446655440000"
 * }
 * ```
 */
export const CREATE_SHIPMENT_RESPONSE_SCHEMA = Type.Object({
  shipmentId: Type.String({ format: "uuid" }),
});

/**
 * Schema for shipment tracking response.
 * Returns detailed tracking information including status history.
 *
 * @example
 * ```json
 * {
 *   "shipmentId": "550e8400-e29b-41d4-a716-446655440000",
 *   "originCity": "New York",
 *   "destinationCity": "Los Angeles",
 *   "packageWeightKg": 5.5,
 *   "packageLengthCm": 30,
 *   "packageWidthCm": 20,
 *   "packageHeightCm": 15,
 *   "calculatedWeightKg": 6.0,
 *   "quotedValue": 150.00,
 *   "currentStatus": "In Transit",
 *   "trackingHistory": [
 *     {
 *       "statusName": "Picked Up",
 *       "timestamp": "2024-01-15T10:30:00Z"
 *     }
 *   ],
 *   "lastUpdate": "2024-01-15T10:30:00Z"
 * }
 * ```
 */
export const GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA = Type.Object({
  shipmentId: Type.String({ format: "uuid" }),
  originCity: Type.String(),
  destinationCity: Type.String(),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
  calculatedWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  quotedValue: Type.Number({ minimum: 1, maximum: 1000000 }),
  currentStatus: Type.String(),
  trackingHistory: Type.Array(
    Type.Object({
      statusId: Type.String({ format: "uuid" }),
      statusName: Type.String(),
      statusDescription: Type.String(),
      timestamp: Type.String({ format: "date-time" }),
    })
  ),
  lastUpdate: Type.String({ format: "date-time" }),
});

/**
 * Custom error schemas for shipment-specific errors.
 */

/**
 * Schema for same origin-destination city error.
 * Used when origin and destination cities are identical.
 *
 * @example
 * ```json
 * {
 *   "message": "Origin and destination cities cannot be the same",
 *   "code": "SAME_ORIGIN_DESTINATION_CITY",
 *   "name": "SameOriginDestinationCityError"
 * }
 * ```
 */
export const SAME_ORIGIN_DESTINATION_CITY_ERROR_SCHEMA = Type.Object({
  message: Type.String({
    example: "Origin and destination cities cannot be the same",
  }),
  code: Type.String({ example: "SAME_ORIGIN_DESTINATION_CITY" }),
  name: Type.String({ example: "SameOriginDestinationCityError" }),
});

/**
 * Schema for shipment not found error.
 * Used when a requested shipment doesn't exist.
 *
 * @example
 * ```json
 * {
 *   "message": "Shipment not found",
 *   "code": "NOT_FOUND",
 *   "name": "NotFoundError"
 * }
 * ```
 */
export const SHIPMENT_NOT_FOUND_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Shipment not found" }),
  code: Type.String({ example: "NOT_FOUND" }),
  name: Type.String({ example: "NotFoundError" }),
});

/**
 * Schema for shipment access denied error.
 * Used when user is not authorized to view a specific shipment.
 *
 * @example
 * ```json
 * {
 *   "message": "Access denied to this shipment's details",
 *   "code": "AUTHORIZATION_ERROR",
 *   "name": "AuthorizationError"
 * }
 * ```
 */
export const SHIPMENT_ACCESS_DENIED_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Access denied to this shipment's details" }),
  code: Type.String({ example: "AUTHORIZATION_ERROR" }),
  name: Type.String({ example: "AuthorizationError" }),
});

/**
 * Type exports for HTTP layer.
 * These types are derived from the schemas and used for TypeScript type checking.
 */

/** Type for shipment quote request body */
export type QuoteShipmentBody = Static<typeof QUOTE_SHIPMENT_BODY_SCHEMA>;

/** Type for shipment creation request body */
export type CreateShipmentBody = Static<typeof CREATE_SHIPMENT_BODY_SCHEMA>;

/** Type for shipment tracking request parameters */
export type GetShipmentTrackingParams = Static<
  typeof GET_SHIPMENT_TRACKING_PARAMS_SCHEMA
>;

/** Type for shipment quote response */
export type QuoteShipmentResponse = Static<
  typeof QUOTE_SHIPMENT_RESPONSE_SCHEMA
>;

/** Type for shipment creation response */
export type CreateShipmentResponse = Static<
  typeof CREATE_SHIPMENT_RESPONSE_SCHEMA
>;

/** Type for shipment tracking response */
export type GetShipmentTrackingResponse = Static<
  typeof GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA
>;
