import { Module } from '@nestjs/common';
import { AppController } from './application.controller';
import { IngredientModule } from './ingredient/ingredient.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RecipesModule } from './recipes/recipes.module';
import { UserModule } from './user/user.module';
import { ImagesModule } from './images/images.module';

import ormconfig from '../ormconfig';

@Module({
  imports: [
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
  controllers: [AppController],
})
export class ApplicationModule {}
