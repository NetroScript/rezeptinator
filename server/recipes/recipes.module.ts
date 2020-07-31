import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { IngredientModule } from '@server/ingredient/ingredient.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeEntity, RecipeSummaryEntity]), IngredientModule],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
