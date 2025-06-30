import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";
import {
  CREATE_SHIPMENT_BODY_SCHEMA,
  CREATE_SHIPMENT_RESPONSE_SCHEMA,
  GET_SHIPMENT_TRACKING_PARAMS_SCHEMA,
  GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA,
  QUOTE_SHIPMENT_BODY_SCHEMA,
  QUOTE_SHIPMENT_RESPONSE_SCHEMA,
  SAME_ORIGIN_DESTINATION_CITY_ERROR_SCHEMA,
  SHIPMENT_ACCESS_DENIED_ERROR_SCHEMA,
  SHIPMENT_NOT_FOUND_ERROR_SCHEMA,
} from "@infrastructure/web/schemas/shipment-schemas";
import {
  NOT_FOUND_ERROR_SCHEMA,
  INTERNAL_SERVER_ERROR_SCHEMA,
} from "@infrastructure/web/schemas/common-schemas";
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
        body: QUOTE_SHIPMENT_BODY_SCHEMA,
        response: {
          200: QUOTE_SHIPMENT_RESPONSE_SCHEMA,
          400: SAME_ORIGIN_DESTINATION_CITY_ERROR_SCHEMA,
          404: NOT_FOUND_ERROR_SCHEMA,
          500: INTERNAL_SERVER_ERROR_SCHEMA,
        },
        security: [{ bearerAuth: [] }],
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
        body: CREATE_SHIPMENT_BODY_SCHEMA,
        response: {
          201: CREATE_SHIPMENT_RESPONSE_SCHEMA,
          400: SAME_ORIGIN_DESTINATION_CITY_ERROR_SCHEMA,
          404: NOT_FOUND_ERROR_SCHEMA,
          500: INTERNAL_SERVER_ERROR_SCHEMA,
        },
        security: [{ bearerAuth: [] }],
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
        params: GET_SHIPMENT_TRACKING_PARAMS_SCHEMA,
        response: {
          200: GET_SHIPMENT_TRACKING_RESPONSE_SCHEMA,
          403: SHIPMENT_ACCESS_DENIED_ERROR_SCHEMA,
          404: SHIPMENT_NOT_FOUND_ERROR_SCHEMA,
          500: INTERNAL_SERVER_ERROR_SCHEMA,
        },
        security: [{ bearerAuth: [] }],
      },
      onRequest: [fastify.authenticate],
    },
    shipmentController.getTrackingDetails.bind(shipmentController)
  );
}
