import { Module } from '@nestjs/common';
import { AppController } from './application.controller';
import { IngredientModule } from './ingredient/ingredient.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RecipesModule } from './recipes/recipes.module';
import { UserModule } from './user/user.module';

import ormconfig from '../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      Object.assign({ autoLoadEntities: true } as TypeOrmModuleOptions, ormconfig),
    ),
    IngredientModule,
    RecipesModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
