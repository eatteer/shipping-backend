export interface ShipmentStatusProps {
  id: string;
  name: string;
  description?: string;
  isFinal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ShipmentStatus {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly isFinal: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public constructor(props: ShipmentStatusProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.isFinal = props.isFinal;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
