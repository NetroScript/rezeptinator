import { Module } from '@nestjs/common';
import { AppController } from './application.controller';
import { IngredientModule } from './ingredient/ingredient.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import ormconfig from '../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      Object.assign({ autoLoadEntities: true } as TypeOrmModuleOptions, ormconfig),
    ),
    IngredientModule,
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
