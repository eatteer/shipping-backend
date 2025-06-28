import { ShipmentController } from "@infrastructure/web/controllers/shipment-controller";
import {
  QUOTE_SHIPMENT_BODY_SCHEMA,
  QUOTE_SHIPMENT_RESPONSE_SCHEMA,
} from "@infrastructure/web/schemas/shipment-schemas";
import { Static, Type } from "@sinclair/typebox";
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
        response: {
          201: QUOTE_SHIPMENT_RESPONSE_SCHEMA,
          409: Type.Object({ message: Type.String() }),
          500: Type.Object({ message: Type.String() }),
        },
      },
    },
    shipmentController.quote.bind(shipmentController)
  );
}
