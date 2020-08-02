import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { In, Repository } from 'typeorm';
import { UserEntity } from '@server/user/user.entity';
import {
  advancedRecipeSearchDto,
  RecipeOrderVariants,
} from '@common/Model/dto/advancedRecipeSearch.dto';
import { PortionEntity } from '@server/recipes/portion.entity';
import { createRecipeDto } from '@common/Model/dto/createRecipe.dto';
import { IIngredient } from '@common/Model/Ingredient';
import { IRecipe, ITag } from '@common/Model/Recipe';
import { TagEntity } from '@server/recipes/tag.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,
    @InjectRepository(PortionEntity)
    private readonly portionRepository: Repository<PortionEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(RecipeStepEntity)
    private readonly recipeStepRepository: Repository<RecipeStepEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async advancedSearchOverview(query: advancedRecipeSearchDto): Promise<IRecipe[]> {
    const recipes: Map<number, RecipeEntity> = new Map();
    const returnData: IRecipe[] = [];

    const queryBuilder = await this.recipeRepository
      .createQueryBuilder('recipe')
      // Get the favourite count
      .addSelect('COUNT(DISTINCT userfavourites.userId)', 'favourites')
      .leftJoin('user_favorites_recipe', 'userfavourites', 'userfavourites.recipeId = recipe.id')
      // Join 1-1 stuff
      .leftJoinAndSelect('recipe.creator', 'creator')
      .leftJoinAndSelect('recipe.recipeSummary', 'summary')
      .leftJoinAndSelect('summary.totalNutritions', 'totalNutritions');

    queryBuilder.where('1 = 1');

    if (!!query.name) {
      queryBuilder.andWhere('recipe.title LIKE :title', { title: `%${query.name}%` });
    }

    if (!!query.includeIngredients) {
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

    if (!!query.excludeIngredients) {
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

    if (!!query.includeCategories) {
      queryBuilder.andWhere(`summary.categories @> '{:categories}'`, {
        categories: query.includeCategories,
      });
    }

    if (!!query.excludeCategories) {
      queryBuilder.andWhere(`NOT (summary.categories @> '{:categories}')`, {
        categories: query.excludeCategories,
      });
    }

    if (!!query.veganLevel) {
      queryBuilder.andWhere('summary.vegan = :vegan', { vegan: query.veganLevel });
    }

    if (!!query.author) {
      queryBuilder.andWhere('recipe.author = :author', { author: query.author });
    }

    if (!!query.maxDifficulty || !!query.minDifficulty) {
      queryBuilder.andWhere('recipe.difficulty BETWEEN :min AND :max', {
        min: query.minDifficulty || 0,
        max: query.maxDifficulty || 1,
      });
    }

    if (!!query.hasTags) {
      queryBuilder.andWhere((qb) => {
        // Within tag to recipe relation find all tags which reference the recipe
        // and are included in the tag array, if the count is the same all required tags are included
        const subQuery = qb
          .subQuery()
          .select('COUNT(*)')
          .from('recipe_tags_tag', 'connector')
          .where('connector.recipeId = recipe.id')
          .andWhere('connector.tagId IN (:ids)', {
            ids: query.hasTags,
          })
          .having('COUNT(*) = :count', { count: query.hasTags.length })
          .getQuery();
        return 'NOT EXISTS ' + subQuery;
      });
    }

    if (!!query.maxCookTime) {
      queryBuilder.andWhere('recipe.cookTime <= :max', { max: query.maxCookTime });
    }

    if (!!query.maxTotalTime) {
      queryBuilder.andWhere('recipe.totalTime <= :max', { max: query.maxTotalTime });
    }

    if (!!query.minimalRating) {
      queryBuilder.andWhere('recipe.rating >= :min', { min: query.minimalRating });
    }

    if (!!query.excludeAllergies) {
      queryBuilder.andWhere(`NOT (summary.allergies @> '{:allergies}')`, {
        allergies: query.excludeAllergies,
      });
    }

    if (!!query.language) {
      queryBuilder.andWhere('recipe.language = :language', { language: query.language });
    }

    // Total amount of results before we apply pagination
    const amount = await queryBuilder.getCount();

    // Code used for pagination
    // By what we should filter
    let sort: string;
    // The order of the data
    const compareOperation = query.ascending ? '>=' : '<=';
    const order = query.ascending ? 'ASC' : 'DESC';
    const orderTypes: string[] = [];
    // Depending on the order mode use different data
    switch (query.order) {
      case RecipeOrderVariants.Default:
        sort = `recipe.id ${compareOperation} :lastid`;
        orderTypes.push('recipe.id');
        break;
      case RecipeOrderVariants.Rating:
        sort = `(recipe.rating, recipe.id) ${compareOperation} (:lastvalue, :lastid)`;
        break;
      case RecipeOrderVariants.Favourites:
        sort = `(favourites, recipe.id) ${compareOperation} (:lastvalue, :lastid)`;
        break;
      case RecipeOrderVariants.Calories:
        sort = `(totalNutritions.calories, recipe.id) ${compareOperation} (:lastvalue, :lastid)`;
        break;
      case RecipeOrderVariants.Difficulty:
        sort = `(recipe.difficulty, recipe.id) ${compareOperation} (:lastvalue, :lastid)`;
        break;
      case RecipeOrderVariants.CookTime:
        sort = `(recipe.cookTime, recipe.id) ${compareOperation} (:lastvalue, :lastid)`;
        break;
    }

    if (orderTypes.length == 0) {
      const partString = sort.split(' ' + compareOperation)[0];
      orderTypes.push(...partString.substr(1, partString.length - 1).split(', '));
    }

    // Apply filter removing all already seen data
    queryBuilder.andWhere(sort, { lastvalue: query.lastValue, lastid: query.lastId });

    // Order
    queryBuilder.orderBy(
      orderTypes.reduce((out, current): { [key: string]: string } => {
        out[current] = order;
        return out;
      }, {}),
    );

    // Only select a specific amount
    queryBuilder.limit(query.pageSize);

    const data = await queryBuilder.getRawAndEntities();

    data.entities.forEach((entity) => recipes.set(entity.id, entity));

    // Load theamount favourites into the Recipes by parsing the raw data
    data.raw.forEach((data: { [key: string]: string | number }): void => {
      const current = recipes.get(data['recipe.id'] as number);
      current.favouriteAmount = data['favourites'] as number;
    });

    const loadedRecipeIds = Array.from(recipes.keys());

    // Load additional data -> Portions, Steps and Tags

    const portions: PortionEntity[] = await this.portionRepository.find({
      where: {
        recipe: In(loadedRecipeIds),
      },
    });

    const steps: RecipeStepEntity[] = await this.recipeStepRepository.find({
      where: {
        recipe: In(loadedRecipeIds),
      },
    });

    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .select('tag.id', 'tagID')
      .addSelect('tag.group', 'group')
      .addSelect('tag.tag', 'tag')
      .addSelect('connection.recipeId', 'recipeID')
      .leftJoin('recipe_tags_tag', 'connection', 'connection.tagId = tag.id')
      .where('connection.recipeId IN :ids', { ids: loadedRecipeIds })
      .getRawMany<{ tagID: number; group: string; tag: string; recipeID: number }>();

    // Save the additionally loaded data into each correct recipe
    portions.forEach((portion) => {
      recipes.get(portion.recipeId).ingredients.push(portion);
    });

    steps.forEach((step) => {
      recipes.get(step.recipeId).recipeSteps.push(step);
    });

    tags.forEach((tag) => {
      recipes
        .get(tag.recipeID)
        .tags.push(new TagEntity({ id: tag.tagID, tag: tag.tag, group: tag.group }));
    });

    // Build the return data from the recipes
    recipes.forEach((entity) => {
      returnData.push({
        cookTime: entity.cookTime,
        creationDate: entity.creationDate,
        creator: entity.creator,
        difficulty: entity.difficulty,
        favourites: entity.favouriteAmount,
        id: entity.id,
        ingredients: entity.ingredients,
        language: entity.language,
        rating: entity.rating,
        recipeSteps: entity.recipeSteps,
        servingSize: entity.servingSize,
        tags: entity.tags,
        title: entity.title,
        totalTime: entity.totalTime,
      });
    });

    // Return the data
    return returnData;
  }

  async create(data: createRecipeDto, userID: number): Promise<void> {
    const recipe = new RecipeEntity();

    return;
  }

  /*
  async findCompleteInList(idList: number[]): Promise<IRecipe[]> {
    return this.recipeRepository.find({ id: In(idList) });
  }
  */
}
