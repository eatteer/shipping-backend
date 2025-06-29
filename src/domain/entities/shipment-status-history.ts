import { UUID } from "crypto";

export interface ShipmentStatusHistoryProps {
  id: UUID;
  shipmentId: UUID;
  statusId: UUID;
  timestamp: Date;
}

export class ShipmentStatusHistory {
  public readonly id: UUID;
  public readonly shipmentId: UUID;
  public readonly statusId: UUID;
  public readonly timestamp: Date;

  public constructor(props: ShipmentStatusHistoryProps) {
    this.id = props.id;
    this.shipmentId = props.shipmentId;
    this.statusId = props.statusId;
    this.timestamp = props.timestamp;
  }
}
