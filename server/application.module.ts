import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino/dist';
import config from '../nuxt.config';

import ormconfig from '../ormconfig';
import { ImagesModule } from './images/images.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { RecipesModule } from './recipes/recipes.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        prettyPrint: config.dev ? { colorize: true } : false,
      },
    }),
    TypeOrmModule.forRoot(
      Object.assign(
        { autoLoadEntities: true, keepConnectionAlive: true } as TypeOrmModuleOptions,
        ormconfig,
      ),
    ),
    IngredientModule,
    RecipesModule,
    UserModule,
    ImagesModule,
  ],
})
export class ApplicationModule {}
