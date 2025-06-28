import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";
import {
  CREATE_SHIPMENT_BODY_SCHEMA,
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
        body: QUOTE_SHIPMENT_BODY_SCHEMA,
      },
      // @ts-expect-error
      onRequest: [fastify.authenticate],
    },
    shipmentController.quote.bind(shipmentController)
  );

  fastify.post(
    "/",
    {
      schema: {
        body: CREATE_SHIPMENT_BODY_SCHEMA,
      },
      // @ts-expect-error
      onRequest: [fastify.authenticate],
    },
    shipmentController.create.bind(shipmentController)
  );
}
