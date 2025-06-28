import { v4 as uuidv4 } from "uuid";

export interface UserProps {
  id?: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public email: string;
  public passwordHash: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  public constructor(props: UserProps) {
    this.id = props.id || uuidv4();
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
