import {
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
  Catch,
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import { Nuxt } from 'nuxt';
import { ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';

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

    if (status === 404) {
      if (!res.res.headersSent) {
        await this.nuxt.render(req.req, res.res);
      }
    } else if (!(exception instanceof HttpException)) {
      res.status(status);
      res.send(Object.assign(baseError, { error: exception }));
    } else {
      const res = exception.getResponse();
      const message =
        !(typeof res === 'undefined' || res === null) && typeof res === 'object'
          ? Object.assign(baseError, res)
          : Object.assign(baseError, { message: res });

      this.server.reply(host.getArgByIndex(1), message, exception.getStatus());
    }
  }
}
