enum Roles {
  Admin,
  User,
}

export interface User {
  name: string;
  joinDate: Date;
  email: string;
  role: Roles[];
}
