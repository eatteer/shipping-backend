import { WebSocket } from "ws";

export type ShipmentStatusUpdateMessage = {
  shipmentId: string;
  newStatusId: string;
  newStatusName: string;
  timestamp: string;
};

export type ShipmentConnections = {
  [shipmentId: string]: Set<WebSocket>;
};

export class WebSocketService {
  private connections: ShipmentConnections = {};

  public registerConnection(shipmentId: string, ws: WebSocket): void {
    if (!this.connections[shipmentId]) {
      this.connections[shipmentId] = new Set();
    }

    this.connections[shipmentId].add(ws);

    console.log(
      `[WebSocketService] Customer connected to shipment ${shipmentId}`
    );

    ws.on("close", () => {
      this.removeConnection(shipmentId, ws);
    });

    ws.on("error", (error) => {
      console.error(
        `[WebSocketService] Error in connection for sending ${shipmentId}:`,
        error
      );

      this.removeConnection(shipmentId, ws);
    });
  }

  public removeConnection(shipmentId: string, ws: WebSocket): void {
    if (this.connections[shipmentId]) {
      this.connections[shipmentId].delete(ws);

      if (this.connections[shipmentId].size === 0) {
        delete this.connections[shipmentId];
      }

      console.log(
        `[WebSocketService] Customer disconnected from shipment ${shipmentId}`
      );
    }
  }

  public notifyShipmentStatusUpdate(
    shipmentId: string,
    message: ShipmentStatusUpdateMessage
  ): void {
    const clients = this.connections[shipmentId];

    if (clients) {
      const messageString = JSON.stringify(message);

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageString);

          console.log(
            `[WebSocketService] Notification sent to customer for shipment ${shipmentId}`
          );
        }
      });
    } else {
      console.log(
        `[WebSocketService] No clients connected for shipment ${shipmentId}`
      );
    }
  }
}
