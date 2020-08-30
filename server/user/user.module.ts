import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesModule } from '@server/recipes/recipes.module';
import { UserEntity } from '@server/user/user.entity';
import { UserRatingEntity } from '@server/user/userRating.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [RecipesModule, TypeOrmModule.forFeature([UserEntity, UserRatingEntity])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
