import { IOwnAccount, Roles } from '@common/Model/User';
import { ApiProperty } from '@nestjs/swagger';

export class DummyAccountDto implements IOwnAccount {
  email: string;
  joinDate: Date;
  profilePicture: string;
  @ApiProperty({ enum: Roles, isArray: true })
  role: Roles[];
  token: string;
  username: string;
}

export interface IJWTPayload {
  id: number;
  username: string;
  email: string;
  roles: Roles[];
  exp: number;
}
