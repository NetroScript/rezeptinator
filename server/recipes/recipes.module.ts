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

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      PortionEntity,
      UserEntity,
      RecipeSummaryEntity,
      RecipeStepEntity,
      TagEntity,
      RecipeEntity,
    ]),
    IngredientModule,
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
