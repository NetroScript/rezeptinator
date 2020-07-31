import { SetMetadata } from '@nestjs/common';
import { Roles } from '@common/Model/User';

export const RequiredRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
