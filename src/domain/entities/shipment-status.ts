import { UUID } from "crypto";

export interface ShipmentStatusProps {
  id: UUID;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ShipmentStatus {
  public readonly id: UUID;
  public readonly name: string;
  public readonly description?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public constructor(props: ShipmentStatusProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
