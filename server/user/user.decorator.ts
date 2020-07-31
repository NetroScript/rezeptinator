import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JWTTokenSecret } from '../config';
import * as jwt from 'jsonwebtoken';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  // Extract the data contained in header and extract information from the token to provide information
  // directly in the method declaration
  const token = req.headers.authorization ? (req.headers.authorization as string).split(' ') : null;
  if (token && token[1]) {
    const decoded: any = jwt.verify(token[1], JWTTokenSecret);
    return !!data ? decoded[data] : decoded.user;
  }

  throw new HttpException(
    { message: 'You need to be logged in to do that.' },
    HttpStatus.UNAUTHORIZED,
  );
});
