import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";
import {
  CREATE_SHIPMENT_BODY_SCHEMA,
  GET_SHIPMENT_TRACKING_PARAMS_SCHEMA,
  QUOTE_SHIPMENT_BODY_SCHEMA,
} from "@infrastructure/web/schemas/shipment-schemas";
import { Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";

interface ShipmentRoutesDependencies {
  shipmentController: ShipmentController;
}

export async function shipmentRoutes(
  fastify: FastifyInstance,
  { shipmentController }: ShipmentRoutesDependencies
) {
  fastify.post<{ Body: Static<typeof QUOTE_SHIPMENT_BODY_SCHEMA> }>(
    "/quote",
    {
      schema: {
        summary: "Get a shipment quote",
        description:
          "Calculates a shipment quote based on origin, destination, package weight, and dimensions. Requires user authentication.",
        tags: ["Shipments"],
        body: QUOTE_SHIPMENT_BODY_SCHEMA, // Your existing TypeBox schema for the request body
        // response: {
        //   200: Type.Object({
        //     originCityId: Type.String({ format: 'uuid', description: 'ID of the origin city.' }),
        //     destinationCityId: Type.String({ format: 'uuid', description: 'ID of the destination city.' }),
        //     packageWeightKg: Type.Number({ description: 'Weight of the package in kilograms.' }),
        //     packageLengthCm: Type.Number({ description: 'Length of the package in centimeters.' }),
        //     packageWidthCm: Type.Number({ description: 'Width of the package in centimeters.' }),
        //     packageHeightCm: Type.Number({ description: 'Height of the package in centimeters.' }),
        //     volumetricWeightKg: Type.Number({ description: 'Calculated volumetric weight in kilograms.' }),
        //     calculatedWeightKg: Type.Number({ description: 'Greater of actual or volumetric weight in kilograms.' }),
        //     quotedValue: Type.Number({ description: 'The total quoted value for the shipment.' }),
        //   }),
        //   400: Type.Object({
        //     message: Type.String({ example: 'Origin and destination cities cannot be the same.' }),
        //     code: Type.String({ example: 'SAME_ORIGIN_DESTINATION_CITY' }),
        //   }),
        //   401: Type.Object({
        //     message: Type.String({ example: 'Unauthorized.' }),
        //     code: Type.String({ example: 'UNAUTHORIZED_ACCESS' }),
        //   }),
        //   404: Type.Object({
        //     message: Type.String({ example: 'Origin city not found.' }),
        //     code: Type.String({ example: 'NOT_FOUND' }),
        //   }),
        //   500: Type.Object({
        //     message: Type.String({ example: 'An unexpected error occurred.' }),
        //   }),
        // },
        security: [{ bearerAuth: [] }], // Indicates this route requires JWT bearer token
      },
      onRequest: [fastify.authenticate],
    },
    shipmentController.quote.bind(shipmentController)
  );

  fastify.post<{ Body: Static<typeof CREATE_SHIPMENT_BODY_SCHEMA> }>(
    "/",
    {
      schema: {
        summary: "Create a new shipment",
        description:
          "Registers a new shipment with its details. Requires user authentication.",
        tags: ["Shipments"],
        body: CREATE_SHIPMENT_BODY_SCHEMA, // Your existing TypeBox schema for the request body
        // response: {
        //   201: Type.Object({
        //     shipmentId: Type.String({
        //       format: "uuid",
        //       description: "The ID of the newly created shipment.",
        //     }),
        //     trackingCode: Type.String({
        //       description: "The unique tracking code for the shipment.",
        //     }),
        //   }),
        //   400: Type.Object({
        //     message: Type.String({
        //       example: "Origin and destination cities cannot be the same.",
        //     }),
        //     code: Type.String({ example: "SAME_ORIGIN_DESTINATION_CITY" }),
        //   }),
        //   401: Type.Object({
        //     message: Type.String({ example: "Unauthorized." }),
        //     code: Type.String({ example: "UNAUTHORIZED_ACCESS" }),
        //   }),
        //   404: Type.Object({
        //     message: Type.String({ example: "Origin city not found." }),
        //     code: Type.String({ example: "NOT_FOUND" }),
        //   }),
        //   500: Type.Object({
        //     message: Type.String({ example: "An unexpected error occurred." }),
        //   }),
        // },
        security: [{ bearerAuth: [] }], // Indicates this route requires JWT bearer token
      },
      onRequest: [fastify.authenticate],
    },
    shipmentController.create.bind(shipmentController)
  );

  fastify.get(
    "/:id/track",
    {
      schema: {
        summary: "Get shipment tracking details",
        description:
          "Retrieves detailed tracking information for a specific shipment by its ID. Requires user authentication.",
        tags: ["Shipments"],
        params: GET_SHIPMENT_TRACKING_PARAMS_SCHEMA, // Your existing TypeBox schema for the request parameters
        // response: {
        //   200: Type.Object({
        //     id: Type.String({ format: 'uuid' }),
        //     trackingCode: Type.String(),
        //     currentStatusName: Type.String(),
        //     lastUpdatedAt: Type.String({ format: 'date-time' }),
        //     originCityName: Type.String(),
        //     destinationCityName: Type.String(),
        //     packageDetails: Type.Object({
        //       weightKg: Type.Number(),
        //       lengthCm: Type.Number(),
        //       widthCm: Type.Number(),
        //       heightCm: Type.Number(),
        //     }),
        //     senderDetails: Type.Object({
        //       name: Type.String(),
        //       address: Type.String(),
        //       phone: Type.String(),
        //     }),
        //     receiverDetails: Type.Object({
        //       name: Type.String(),
        //       address: Type.String(),
        //       phone: Type.String(),
        //     }),
        //     statusHistory: Type.Array(
        //       Type.Object({
        //         statusName: Type.String(),
        //         timestamp: Type.String({ format: 'date-time' }),
        //       })
        //     ),
        //   }),
        //   401: Type.Object({
        //     message: Type.String({ example: 'Unauthorized.' }),
        //     code: Type.String({ example: 'UNAUTHORIZED_ACCESS' }),
        //   }),
        //   403: Type.Object({
        //     message: Type.String({ example: 'User is not authorized to view this shipment.' }), // More general message
        //     code: Type.String({ example: 'UNAUTHORIZED_SHIPMENT_ACCESS' }),
        //   }),
        //   404: Type.Object({
        //     message: Type.String({ example: 'Shipment not found.' }),
        //     code: Type.String({ example: 'NOT_FOUND' }),
        //   }),
        //   500: Type.Object({
        //     message: Type.String({ example: 'An unexpected error occurred.' }),
        //   }),
        // },
        security: [{ bearerAuth: [] }], // Indicates this route requires JWT bearer token
      },
      onRequest: [fastify.authenticate],
    },
    shipmentController.getTrackingDetails.bind(shipmentController)
  );
}
