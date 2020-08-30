import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesEntity } from '@server/images/images.entity';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { IngredientModule } from '@server/ingredient/ingredient.module';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { PortionEntity } from '@server/recipes/portion.entity';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { TagEntity } from '@server/recipes/tag.entity';
import { UserEntity } from '@server/user/user.entity';
import { UserRatingEntity } from '@server/user/userRating.entity';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [
    IngredientModule,
    TypeOrmModule.forFeature([
      PortionEntity,
      UserEntity,
      ImagesEntity,
      RecipeSummaryEntity,
      UserRatingEntity,
      NutrientEntity,
      IngredientEntity,
      RecipeStepEntity,
      TagEntity,
      RecipeEntity,
    ]),
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
