import { v4 as uuidv4 } from "uuid";

export interface CityProps {
  id?: string;
  name: string;
  departmentId: string;
  zoneId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class City {
  public readonly id: string;
  public name: string;
  public departmentId: string;
  public zoneId: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  public constructor(props: CityProps) {
    this.id = props.id || uuidv4();
    this.name = props.name;
    this.departmentId = props.departmentId;
    this.zoneId = props.zoneId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
