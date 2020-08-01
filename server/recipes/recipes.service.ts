import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '@server/user/user.entity';
import {
  advancedRecipeSearchDto,
  QueryDetailLevel,
} from '@common/Model/dto/advancedRecipeSearch.dto';
import { PortionEntity } from '@server/recipes/portion.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async advancedSearch(query: advancedRecipeSearchDto): Promise<RecipeEntity[]> {
    const recipes: RecipeEntity[] = [];

    const queryBuilder = await this.recipeRepository.createQueryBuilder('recipe');

    if (query.detail == QueryDetailLevel.Complete) {
      queryBuilder
        .leftJoinAndSelect('recipe.creator', 'creator')
        .leftJoinAndSelect('recipe.ingredients', 'portions')
        .leftJoinAndSelect('portions.ingredient', 'ingredients')
        .leftJoinAndSelect('recipe.tags', 'tags')
        .leftJoinAndSelect('recipe.recipeSummary', 'summary');
    }

    queryBuilder.where('1 = 1');

    if (query.name !== undefined) {
      queryBuilder.andWhere('recipe.title LIKE :title', { title: `%${query.name}%` });
    }

    if (query.includeIngredients !== undefined) {
      queryBuilder.andWhere((qb) => {
        // Within that recipe find all ingredients which are in the include Ingredients list
        // If the amount of those ingredients is equal to the amount of the required ingredients
        // return true (because then one row exists, otherwise no rows exist)
        const subQuery = qb
          .subQuery()
          .select('COUNT(*)')
          .from(PortionEntity, 'portion')
          .where('portion.recipeId = recipe.id')
          .andWhere('portion.ingredientID IN (:ingredients)', {
            ingredients: query.includeIngredients,
          })
          .having('COUNT(*) = :count', { count: query.includeIngredients.length })
          .getQuery();
        return 'EXISTS ' + subQuery;
      });
    }

    if (query.excludeIngredients !== undefined) {
      queryBuilder.andWhere((qb) => {
        // Within that recipe find all ingredients which are in the exclude Ingredients list
        // If any ingredient is found, a row is returned and thus the query will be wrong
        const subQuery = qb
          .subQuery()
          .select()
          .from(PortionEntity, 'portion')
          .where('portion.recipeId = recipe.id')
          .andWhere('portion.ingredientID IN (:ingredients)', {
            ingredients: query.excludeIngredients,
          })
          .getQuery();
        return 'NOT EXISTS ' + subQuery;
      });
    }

    return queryBuilder.skip(query.skip).take(query.take).getMany();
  }
}
