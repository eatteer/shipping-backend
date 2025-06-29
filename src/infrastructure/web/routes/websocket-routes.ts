import { GetShipmentTrackingDetails } from "@application/use-cases/shipments/get-shipment-tracking-details";
import { WebSocketService } from "@infrastructure/web/websocket/websocket-service";
import { FastifyInstance } from "fastify";

type WebSocketRoutesDependencies = {
  webSocketService: WebSocketService;
  getShipmentTrackingDetails: GetShipmentTrackingDetails;
};

export async function websocketRoutes(
  fastify: FastifyInstance,
  { webSocketService, getShipmentTrackingDetails }: WebSocketRoutesDependencies
) {
  fastify.get(
    "/ws/shipments/:id/track",
    {
      websocket: true,
      onRequest: [fastify.authenticate],
    },
    async (connection, req) => {
      const { id: shipmentId } = req.params as { id: string };

      try {
        await getShipmentTrackingDetails.execute({
          shipmentId,
          userId: req.user.userId,
        });

        webSocketService.registerConnection(shipmentId, connection);

        console.log(
          `[WebSocketRoute] Customer authorized and connected to shipment tracking ${shipmentId}`
        );
      } catch (error) {
        console.error(
          `[WebSocketRoute] Error establishing WebSocket connection for sending ${shipmentId}:`,
          error
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to establish WebSocket connection";

        connection.send(JSON.stringify({ error: errorMessage }));

        connection.close(1008, errorMessage); // Code 1008: Violation policy
      }
    }
  );
}
