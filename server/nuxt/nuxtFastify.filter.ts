import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpServer,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ServerResponse } from 'http';
import { Nuxt } from 'nuxt';

@Catch()
export class NuxtFastifyFilter implements ExceptionFilter {
  private readonly nuxt: Nuxt;
  private readonly server: HttpServer;

  constructor(server: HttpServer, nuxt: Nuxt) {
    this.nuxt = nuxt;
    this.server = server;
  }

  public async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply<ServerResponse>>();
    const req = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const baseError = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.req.url,
    };

    // HttpException, the standard error response
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    // No handler for the requested route, just return the front end
    if (
      status === 404 &&
      !(
        exceptionResponse != undefined &&
        //eslint-disable-next-line @typescript-eslint/ban-types
        (exceptionResponse as object).hasOwnProperty('message') !== undefined &&
        !exceptionResponse['message'].startsWith('Cannot GET')
      )
    ) {
      if (!res.res.headersSent) {
        await this.nuxt.render(req.req, res.res);
      } else {
        res.status(status);
        res.send(Object.assign(baseError, { error: exception }));
      }
      // No HTTP Error, send a basic error message
    } else if (!(exception instanceof HttpException)) {
      res.status(status);
      res.send(Object.assign(baseError, { error: exception }));
    } else {
      const message =
        !(typeof exceptionResponse === 'undefined' || exceptionResponse === null) &&
        typeof exceptionResponse === 'object'
          ? Object.assign(baseError, exceptionResponse)
          : Object.assign(baseError, { message: exceptionResponse });

      this.server.reply(host.getArgByIndex(1), message, exception.getStatus());
    }
  }
}
