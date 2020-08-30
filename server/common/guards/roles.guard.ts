import { Roles } from '@common/Model/User';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JWTTokenSecret } from '@server/config';
import { IJWTPayload } from '@server/user/dto/accountDto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // fetch the required roles
    const roles = this.reflector.get<Roles[]>('roles', context.getHandler());
    // if no required roles allow the access
    if (!roles) {
      return true;
    }

    // get the request
    const request = context.switchToHttp().getRequest();
    const lackingRoles: Roles[] = [];

    // Extract the data contained in header and extract information from the token to provide information
    // directly in the method declaration
    const token = request.headers.authorization
      ? (request.headers.authorization as string).split(' ')
      : null;
    if (token && token[1]) {
      const decoded: IJWTPayload = jwt.verify(token[1], JWTTokenSecret) as IJWTPayload;

      // Ignore all the role checks for someone with the owner role
      if (decoded.roles.includes(Roles.Owner)) {
        return true;
      }

      // Check if every needed role is contained in all the contained roles
      if (
        roles.every((role) => {
          if (!decoded.roles.includes(role)) {
            lackingRoles.push(role);
            return false;
          }
          return true;
        })
      ) {
        return true;
      }
    } else {
      lackingRoles.push(...roles);
    }

    // Throw an Unauthorized Error if the user doesn't have enough permissions
    throw new HttpException(
      { message: 'You need a higher role to do that.', missingRoles: lackingRoles },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
