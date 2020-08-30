import { Roles } from '@common/Model/User';
import { SetMetadata } from '@nestjs/common';

export const RequiredRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
