import { ExceptionFilter, HttpException, ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { Nuxt } from 'nuxt';
import { ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class NuxtFastifyFilter implements ExceptionFilter {
  private readonly nuxt: Nuxt;

  constructor(nuxt: Nuxt) {
    this.nuxt = nuxt;
  }

  public async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply<ServerResponse>>();
    const req = ctx.getRequest<FastifyRequest>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === 404) {
      if (!res.res.headersSent) {
        await this.nuxt.render(req.req, res.res);
      }
    } else {
      res.status(status);
      res.send({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: req.req.url,
        error: exception,
      });
    }
  }
}
