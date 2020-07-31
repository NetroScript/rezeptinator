export enum Roles {
  User,
  Admin,
  Owner,
}

export interface IUser {
  username: string;
  joinDate: Date;
  email: string;
  profilePicture: string;
  role: Roles[];
}

export interface IOwnAccount extends IUser {
  token: string;
}
