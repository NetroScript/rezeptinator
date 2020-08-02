import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { IngredientModule } from '@server/ingredient/ingredient.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { PortionEntity } from '@server/recipes/portion.entity';
import { TagEntity } from '@server/recipes/tag.entity';
import { UserModule } from '@server/user/user.module';
import { UserEntity } from '@server/user/user.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';

@Module({
  imports: [
    UserModule,
    IngredientModule,
    TypeOrmModule.forFeature([
      PortionEntity,
      UserEntity,
      RecipeSummaryEntity,
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
