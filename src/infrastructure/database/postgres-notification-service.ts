import { PostgresDb } from "@fastify/postgres";
import {
  ShipmentStatusUpdateMessage,
  WebSocketService,
} from "@infrastructure/web/websocket/websocket-service";
import { PoolClient } from "pg";

export class PostgresNotificationService {
  private readonly channelName = "shipment_updates";

  private client: PoolClient | null = null;

  public constructor(
    private readonly pg: PostgresDb,
    private readonly webSocketService: WebSocketService
  ) {}

  public async startListening(): Promise<void> {
    try {
      // Dedicated client connection for the listener, since other operations can close connections.
      this.client = await this.pg.connect();

      this.client.on("notification", (msg) => {
        if (msg.channel === this.channelName) {
          try {
            const payload: ShipmentStatusUpdateMessage & {
              newStatusId: string;
            } = JSON.parse(msg.payload || "{}");

            console.log(
              `[PostgresNotificationService] Notification received from channel ${msg.channel}:`,
              payload
            );

            this.webSocketService.notifyShipmentStatusUpdate(
              payload.shipmentId,
              {
                shipmentId: payload.shipmentId,
                newStatusId: payload.newStatusId,
                newStatusName: payload.newStatusName,
                timestamp: payload.timestamp,
              }
            );
          } catch (error) {
            console.error(
              `[PostgresNotificationService] Error parsing notification payload:`,
              error
            );
          }
        }
      });

      await this.client.query(`LISTEN ${this.channelName}`);

      console.log(
        `[PostgresNotificationService] Listening on the channel ‘${this.channelName}’ for dispatch updates`
      );
    } catch (error) {
      console.error(
        "[PostgresNotificationService] Error starting PostgreSQL listener:",
        error
      );
    }
  }

  /**
   * Stops the PostgreSQL listener and releases the connection.
   */
  public async stopListening(): Promise<void> {
    if (this.client) {
      try {
        await this.client.query(`UNLISTEN ${this.channelName}`);

        this.client.release();

        this.client = null;

        console.log(
          `[PostgresNotificationService] Dejó de escuchar el canal '${this.channelName}'`
        );
      } catch (error) {
        console.error(
          "[PostgresNotificationService] Error al detener el listener de PostgreSQL:",
          error
        );
      }
    }
  }
}
