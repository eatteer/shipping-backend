import { Type } from "@sinclair/typebox";

export const QUOTE_SHIPMENT_BODY_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
});

export const QUOTE_SHIPMENT_RESPONSE_SCHEMA = Type.Object({
  originCityId: Type.String({ format: "uuid" }),
  destinationCityId: Type.String({ format: "uuid" }),
  packageWeightKg: Type.Number({ minimum: 1, maximum: 1000 }),
  packageHeightCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageWidthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  packageLengthCm: Type.Number({ minimum: 1, maximum: 1000 }),
  quotedValue: Type.Number({ minimum: 1 }),
});
