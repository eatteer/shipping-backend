import { v4 as uuidv4 } from "uuid";

export interface ShipmentProps {
  id?: string;
  userId: string;
  originCityId: string;
  destinationCityId: string;
  packageWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  calculatedWeightKg: number;
  quotedValue: number;
  currentStatusId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Shipment {
  public readonly id: string;
  public userId: string;
  public originCityId: string;
  public destinationCityId: string;
  public packageWeightKg: number;
  public packageLengthCm: number;
  public packageWidthCm: number;
  public packageHeightCm: number;
  public calculatedWeightKg: number;
  public quotedValue: number;
  public currentStatusId: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: ShipmentProps) {
    this.id = props.id || uuidv4();
    this.userId = props.userId;
    this.originCityId = props.originCityId;
    this.destinationCityId = props.destinationCityId;
    this.packageWeightKg = props.packageWeightKg;
    this.packageLengthCm = props.packageLengthCm;
    this.packageWidthCm = props.packageWidthCm;
    this.packageHeightCm = props.packageHeightCm;
    this.calculatedWeightKg = props.calculatedWeightKg;
    this.quotedValue = props.quotedValue;
    this.currentStatusId = props.currentStatusId || "";
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
