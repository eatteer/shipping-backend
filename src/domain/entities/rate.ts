import { v4 as uuidv4 } from "uuid";

export interface RateProps {
  id?: string;
  originZoneId: string;
  destinationZoneId: string;
  pricePerKg: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Rate {
  public readonly id: string;
  public originZoneId: string;
  public destinationZoneId: string;
  public pricePerKg: number;
  public readonly createdAt: Date;
  public updatedAt: Date;

  public constructor(props: RateProps) {
    this.id = props.id || uuidv4();
    this.originZoneId = props.originZoneId;
    this.destinationZoneId = props.destinationZoneId;
    this.pricePerKg = props.pricePerKg;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
