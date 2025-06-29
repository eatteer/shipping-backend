export interface ShipmentStatusHistoryProps {
  id: string;
  shipmentId: string;
  statusId: string;
  timestamp: Date;
}

export class ShipmentStatusHistory {
  public readonly id: string;
  public readonly shipmentId: string;
  public readonly statusId: string;
  public readonly timestamp: Date;

  public constructor(props: ShipmentStatusHistoryProps) {
    this.id = props.id;
    this.shipmentId = props.shipmentId;
    this.statusId = props.statusId;
    this.timestamp = props.timestamp;
  }
}
