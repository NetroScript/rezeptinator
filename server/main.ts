import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fmp from 'fastify-multipart';
import { Logger } from 'nestjs-pino';
import config from '../nuxt.config';

import { ApplicationModule } from './application.module';

import { NuxtServer } from './nuxt';
import { NuxtFastifyFilter } from './nuxt/nuxtFastify.filter';

const log = new NestLogger('Bootstrap');

declare const module: any;

async function bootstrap() {
  try {
    const nuxt = await NuxtServer.getInstance().run(config.dev ? !module.hot._main : true);

    const APIConfig = new DocumentBuilder()
      .setTitle('Rezepteapp')
      .setDescription('API which is used internally to make the Vue frontend work')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const adapter = new FastifyAdapter();

    adapter.register(fmp);

    const app = await NestFactory.create<NestFastifyApplication>(ApplicationModule, adapter);

    app.useLogger(app.get(Logger));

    const document = SwaggerModule.createDocument(app, APIConfig);
    SwaggerModule.setup('api', app, document);

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new NuxtFastifyFilter(app.getHttpAdapter(), nuxt));

    if (!config.dev) {
      app.enableShutdownHooks();

      const signals = ['SIGTERM', 'SIGINT'] as const;
      signals.forEach((signal) => {
        process.on(signal, async () => {
          log.log(`[${signal}] received, closing App`);

          await nuxt.close();
          await app.close();

          log.log(`[${signal}] App closed`);
        });
      });
    }

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }

    await app.listen(config.env.port as number, config.env.host, (e) => {
      if (e != undefined) {
        log.error(e.message, e.stack);
      } else {
        log.log(`Server listening at ${config.env.host}:${config.env.port}`);
        log.log(`Server listening at ${config.env.domain}`);
      }
    });
  } catch (e) {
    log.error(e.message, e.trace);
  }
}
bootstrap();
