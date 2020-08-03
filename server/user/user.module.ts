import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@server/user/user.entity';
import { UserRatingEntity } from '@server/user/userRating.entity';
import { RecipesModule } from '@server/recipes/recipes.module';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { PortionEntity } from '@server/recipes/portion.entity';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';

@Module({
  imports: [
    RecipesModule,
    TypeOrmModule.forFeature([
      UserEntity,
      UserRatingEntity,
      /*
      RecipeEntity,
      RecipeStepEntity,
      RecipeSummaryEntity,
      PortionEntity,
      IngredientEntity,
             */
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
