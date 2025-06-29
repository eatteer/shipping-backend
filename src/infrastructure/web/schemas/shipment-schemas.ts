import { Static, Type } from "@sinclair/typebox";

// Request schemas
export const QUOTE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

export const CREATE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

export const GET_SHIPMENT_TRACKING_PARAMS_SCHEMA = Type.Object({
  id: Type.String({ format: "uuid" }),
});

// Response schemas
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

export const CREATE_SHIPMENT_RESPONSE_SCHEMA = Type.Object({
  shipmentId: Type.String({ format: "uuid" }),
});

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
      statusName: Type.String(),
      timestamp: Type.String({ format: "date-time" }),
    })
  ),
  lastUpdate: Type.String({ format: "date-time" }),
});

// Custom error schemas for shipment-specific errors
export const SAME_ORIGIN_DESTINATION_CITY_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Origin and destination cities cannot be the same" }),
  code: Type.String({ example: "SAME_ORIGIN_DESTINATION_CITY" }),
  name: Type.String({ example: "SameOriginDestinationCityError" }),
});

export const SHIPMENT_NOT_FOUND_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Shipment not found" }),
  code: Type.String({ example: "NOT_FOUND" }),
  name: Type.String({ example: "NotFoundError" }),
});

export const SHIPMENT_ACCESS_DENIED_ERROR_SCHEMA = Type.Object({
  message: Type.String({ example: "Access denied to this shipment's details" }),
  code: Type.String({ example: "AUTHORIZATION_ERROR" }),
  name: Type.String({ example: "AuthorizationError" }),
});

// Type exports for HTTP layer
export type QuoteShipmentBody = Static<typeof QUOTE_SHIPMENT_BODY_SCHEMA>;
export type CreateShipmentBody = Static<typeof CREATE_SHIPMENT_BODY_SCHEMA>;
export type GetShipmentTrackingParams = Static<typeof GET_SHIPMENT_TRACKING_PARAMS_SCHEMA>;
export type QuoteShipmentResponse = Static<typeof QUOTE_SHIPMENT_RESPONSE_SCHEMA>;
export type CreateShipmentResponse = Static<typeof CREATE_SHIPMENT_RESPONSE_SCHEMA>;
export type GetShipmentTrackingResponse = Static<typeof GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA>;
