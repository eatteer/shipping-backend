import { Static, Type } from "@sinclair/typebox";

export const QUOTE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

export type QuoteShipmentBody = Static<typeof QUOTE_SHIPMENT_BODY_SCHEMA>;

export const QUOTE_SHIPMENT_RESPONSE_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
  volumetricWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  calculatedWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  quotedValue: Type.Number({ minimum: 1, maximum: 1000000 }),
});

export type QuoteShipmentResponse = Static<
  typeof QUOTE_SHIPMENT_RESPONSE_SCHEMA
>;

export const CREATE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

export type CreateShipmentBody = Static<typeof CREATE_SHIPMENT_BODY_SCHEMA>;

export const CREATE_SHIPMENT_RESPONSE_SCHEMA = Type.Object({
  shipmentId: Type.String({ format: "uuid" }),
});

export type CreateShipmentResponse = Static<
  typeof CREATE_SHIPMENT_RESPONSE_SCHEMA
>;

export const GET_SHIPMENT_TRACKING_PARAMS_SCHEMA = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export type GetShipmentTrackingParams = Static<
  typeof GET_SHIPMENT_TRACKING_PARAMS_SCHEMA
>;

export const GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA = Type.Object({
  shipmentId: Type.String({ format: "uuid" }),
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
  calculatedWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  quotedValue: Type.Number({ minimum: 1, maximum: 1000000 }),
  currentStatus: Type.String(),
  trackingEvents: Type.Array(
    Type.Object({
      statusName: Type.String(),
      timestamp: Type.String({ format: "date-time" }),
    })
  ),
  lastUpdatedAt: Type.String({ format: "date-time" }),
});

export type GetShipmentTrackingResponse = Static<
  typeof GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA
>;
