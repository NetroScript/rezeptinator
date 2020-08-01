import { Module } from '@nestjs/common';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { IngredientModule } from '@server/ingredient/ingredient.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { PortionEntity } from '@server/recipes/portion.entity';
import { TagEntity } from '@server/recipes/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortionEntity, RecipeSummaryEntity, TagEntity, RecipeEntity]),
    IngredientModule,
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
