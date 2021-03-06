import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { IRecipeQueryResult, RecipeOrderVariants, TagList } from '@common/Model/Recipe/Recipe';
import { getRecipeSummaryFromIPortion } from '@common/utils/summary';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesEntity } from '@server/images/images.entity';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { IngredientService } from '@server/ingredient/ingredient.service';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { advancedRecipeSearchDto } from '@server/recipes/dto/advancedRecipeSearch.dto';
import { createRecipeDto } from '@server/recipes/dto/createRecipe.dto';
import { PortionEntity } from '@server/recipes/portion.entity';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipeStepEntity } from '@server/recipes/recipeStep.entity';
import { RecipeSummaryEntity } from '@server/recipes/recipeSummary.entity';
import { TagEntity } from '@server/recipes/tag.entity';
import { UserEntity } from '@server/user/user.entity';
import { UserRatingEntity } from '@server/user/userRating.entity';
import { DeleteResult, In, Like, Repository } from 'typeorm';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepository: Repository<RecipeEntity>,
    @InjectRepository(PortionEntity)
    private readonly portionRepository: Repository<PortionEntity>,
    @InjectRepository(ImagesEntity)
    private readonly imageRepository: Repository<ImagesEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(RecipeStepEntity)
    private readonly recipeStepRepository: Repository<RecipeStepEntity>,
    @InjectRepository(RecipeSummaryEntity)
    private readonly recipeSummaryRepository: Repository<RecipeSummaryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRatingEntity)
    private readonly userRatingRepository: Repository<UserRatingEntity>,
    private readonly ingredientService: IngredientService,
  ) {}

  async advancedSearchOverview(
    query: advancedRecipeSearchDto,
    userID: number | undefined = undefined,
  ): Promise<IRecipeQueryResult> {
    const recipes: Map<number, RecipeEntity> = new Map();
    const returnData: IRecipeQueryResult = {
      lastId: query.lastId,
      lastValue: query.lastValue,
      recipes: [],
      totalCount: 0,
    };

    // Maps to later assign information to the objects based on their ids
    const favoriteMap: Map<number, boolean> = new Map();
    const ratingMap: Map<number, number> = new Map();

    const queryBuilder = await this.recipeRepository
      .createQueryBuilder('recipe')
      // Get the favourite count
      .addSelect('COUNT(DISTINCT userfavorites.userId)', 'favorites')
      .addSelect('COUNT(DISTINCT ratings."userId")', 'totalratings')
      .leftJoin('user_favorites_recipe', 'userfavorites', 'userfavorites.recipeId = recipe.id')
      .leftJoin('rating', 'ratings', 'ratings."recipeId" = recipe.id')
      // Join 1-1 stuff
      .leftJoinAndSelect('recipe.creator', 'creator')
      .leftJoinAndSelect('recipe.recipeSummary', 'summary')
      .leftJoinAndSelect('summary.totalNutritions', 'totalNutritions');

    queryBuilder.where('1 = 1');

    if (!!query.name) {
      queryBuilder.andWhere('LOWER(recipe.title) LIKE :title', {
        title: `%${query.name.toLowerCase()}%`,
      });
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
          .where('portion.recipe = recipe.id')
          .andWhere('portion.ingredient IN (:...includeingredients)', {
            includeingredients: query.includeIngredients,
          })
          .having('COUNT(*) = :includecount', { includecount: query.includeIngredients.length })
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
          .where('portion.recipe = recipe.id')
          .andWhere('portion.ingredient IN (:...excludeingredients)', {
            excludeingredients: query.excludeIngredients,
          })
          .getQuery();
        return 'NOT EXISTS ' + subQuery;
      });
    }

    if (!!query.includeCategories) {
      queryBuilder.andWhere(
        `summary.categories @> '{${query.includeCategories.join(',').replace(/[^0-9,]/g, '')}}'`,
      );
    }

    if (!!query.excludeCategories) {
      queryBuilder.andWhere(
        `NOT summary.categories @> '{${query.excludeCategories
          .join(',')
          .replace(/[^0-9,]/g, '')}}'`,
      );
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
          .andWhere('connector.tagId IN (:...ids)', {
            ids: query.hasTags,
          })
          .having('COUNT(*) = :count', { count: query.hasTags.length })
          .getQuery();
        return 'EXISTS ' + subQuery;
      });
    }

    if (!!query.maxCookTime) {
      queryBuilder.andWhere('recipe.cookTime <= :maxCook', { maxCook: query.maxCookTime });
    }

    if (!!query.maxTotalTime) {
      queryBuilder.andWhere('recipe.totalTime <= :maxTotal', { maxTotal: query.maxTotalTime });
    }

    if (!!query.minimalRating) {
      queryBuilder.andWhere('recipe.rating >= :minRating', { minRating: query.minimalRating });
    }

    if (!!query.excludeAllergies) {
      queryBuilder.andWhere(
        `NOT summary.allergies @> '{${query.excludeAllergies.join(',').replace(/[^0-9,]/g, '')}}'`,
      );
    }

    if (!!query.language) {
      queryBuilder.andWhere('recipe.language = :language', { language: query.language });
    }

    // Because we used an aggregate function we also need a group by
    queryBuilder
      .groupBy('recipe.id')
      .addGroupBy('creator.id')
      .addGroupBy('summary.id')
      .addGroupBy('totalNutritions.id');

    // Total amount of results before we apply pagination
    const amount = await queryBuilder.getCount();

    // Code used for pagination
    // By what we should filter
    let sort: string;
    let isHaving: boolean;
    // The order of the data
    const compareOperation = query.ascending ? '>' : '<';
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
        sort = `(COUNT(DISTINCT userfavorites.userId), recipe.id) ${compareOperation} (:lastvalue, :lastid)`;
        // Aggregation is not possible in where, and accessing the column also isn't, so we need to put it in Having
        isHaving = true;
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
      orderTypes.push(...partString.substr(1, partString.length - 2).split(', '));
    }

    // Apply filter removing all already seen data
    if (query.lastValue != undefined && query.lastId != undefined) {
      if (!isHaving) {
        queryBuilder.andWhere(sort, { lastvalue: query.lastValue, lastid: query.lastId });
      } else {
        queryBuilder.having(sort, { lastvalue: query.lastValue, lastid: query.lastId });
      }
    }

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

    data.entities.forEach((entity) => {
      entity.ingredients = [];
      entity.tags = [];
      entity.recipeSteps = [];
      entity.favorites = [];
      entity.ratings = [];
      entity.imageEntities = [];
      recipes.set(entity.id, entity);
    });

    // Load theamount favourites into the Recipes by parsing the raw data
    data.raw.forEach((data: { [key: string]: string | number }): void => {
      const current = recipes.get(data['recipe_id'] as number);
      current.favoriteAmount = parseInt(data['favorites'] as string);
      current.ratingAmount = parseInt(data['totalratings'] as string);
    });

    const loadedRecipeIds = Array.from(recipes.keys());

    // Load additional data -> Portions, Steps and Tags - assuming there are more than one
    if (loadedRecipeIds.length > 0) {
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

      // Extract the tags as raw data
      const tags = await this.tagRepository
        .createQueryBuilder('tag')
        .select('tag.id', 'tagID')
        .addSelect('tag.group', 'group')
        .addSelect('tag.tag', 'tag')
        .addSelect('connection.recipeId', 'recipeID')
        .leftJoin('recipe_tags_tag', 'connection', 'connection.tagId = tag.id')
        .where('connection.recipeId IN (:...ids)', { ids: loadedRecipeIds })
        .getRawMany<{ tagID: number; group: string; tag: string; recipeID: number }>();

      const images: { imageId: number; recipeId: number }[] = await this.imageRepository.query(
        `SELECT * from recipe_image_entities_image WHERE "recipeId" IN (${loadedRecipeIds.join(
          ',',
        )})`,
      );

      // If a logged in user is making the request fetch data which is connected to his account
      if (userID != undefined) {
        const favorites: {
          userId: number;
          recipeId: number;
        }[] = await this.userRatingRepository.query(
          `SELECT * from user_favorites_recipe WHERE "recipeId" IN (${loadedRecipeIds.join(
            ',',
          )}) AND "userId" = ${userID}`,
        );

        favorites.forEach((data) => {
          favoriteMap.set(data.recipeId, true);
        });

        const ratings: {
          userId: number;
          recipeId: number;
          rating: number;
        }[] = await this.userRatingRepository.query(
          `SELECT * from rating WHERE "recipeId" IN (${loadedRecipeIds.join(
            ',',
          )}) AND "userId" = ${userID}`,
        );

        ratings.forEach((data) => {
          ratingMap.set(data.recipeId, data.rating);
        });
      }

      // Save the additionally loaded data into each correct recipe
      portions.forEach((portion) => {
        recipes.get(portion.recipeId).ingredients.push(portion);
      });

      steps.forEach((step) => {
        recipes.get(step.recipeId).recipeSteps.push(step);
      });

      // Get the tags using the raw data
      tags.forEach((tag) => {
        recipes
          .get(tag.recipeID)
          .tags.push(new TagEntity({ id: tag.tagID, tag: tag.tag, group: tag.group }));
      });

      images.forEach((image) => {
        const recipe = recipes.get(image.recipeId);
        if (recipe != undefined) {
          recipe.imageEntities.push(new ImagesEntity({ id: image.imageId }));
        }
      });
    }

    // Build the return data from the recipes
    recipes.forEach((entity) => {
      returnData.recipes.push({
        cookTime: entity.cookTime,
        creationDate: entity.creationDate,
        creator: entity.creator.convertToIUser(),
        difficulty: entity.difficulty,
        favorites: entity.favoriteAmount,
        ratingAmount: entity.ratingAmount,
        id: entity.id,
        ingredients: entity.ingredients,
        language: entity.language,
        rating: entity.rating,
        recipeSteps: entity.recipeSteps,
        servingSize: entity.servingSize,
        tags: entity.tags,
        title: entity.title,
        totalTime: entity.totalTime,
        recipeSummary: entity.recipeSummary,
        images: entity.imageEntities.map((entity) => entity.id),
        isFavorited: favoriteMap.get(entity.id) || false,
        userRating: ratingMap.get(entity.id),
      });
    });

    returnData.totalCount = amount;
    if (returnData.recipes.length > 0) {
      const [lastRecipe] = returnData.recipes.slice(-1);
      returnData.lastId = lastRecipe.id;
      returnData.lastValue =
        query.order == RecipeOrderVariants.Favourites
          ? lastRecipe.favorites
          : query.order == RecipeOrderVariants.Calories
          ? lastRecipe.recipeSummary.totalNutritions.calories
          : query.order == RecipeOrderVariants.Rating
          ? lastRecipe.rating
          : query.order == RecipeOrderVariants.CookTime
          ? lastRecipe.cookTime
          : query.order == RecipeOrderVariants.Difficulty
          ? lastRecipe.difficulty
          : 0;
    }

    // Return the data
    return returnData;
  }

  async create(data: createRecipeDto, userID: number): Promise<number> {
    let recipe = new RecipeEntity();

    recipe.title = data.title;
    recipe.cookTime = data.cookTime;
    // Set the creator of the recipe
    recipe.creator = await this.userRepository.findOneOrFail({ id: userID });
    recipe.difficulty = data.difficulty;

    let fetchIngredientsIds: [number, number][] = [];

    // Map all the PortionEntities and create Ingredients (+nutritions) for those which are still needed
    recipe.ingredients = data.ingredients.map<PortionEntity>((ingredient, index) => {
      const portion = new PortionEntity(ingredient);
      // Instead of loading the entity just set the corresponding column and load it later in bulk
      if (ingredient.ingredient != undefined) {
        portion.ingredientId = ingredient.ingredient;
        fetchIngredientsIds.push([ingredient.ingredient, index]);
        // Otherwise create a new ingredient
      } else if (ingredient.newIngredient != undefined) {
        portion.ingredient = new IngredientEntity(
          Object.assign({ alias: [] }, ingredient.newIngredient),
        );
        portion.ingredient.userGenerated = true;

        if (ingredient.newIngredient.nutritions != undefined) {
          portion.ingredient.nutritions = new NutrientEntity(ingredient.newIngredient.nutritions);
        }
      }
      return portion;
    });

    // Sort the ids, because we don't know in which order the database will return results, so we sort them by id
    fetchIngredientsIds = fetchIngredientsIds.sort((a, b) => a[0] - b[0]);

    // Load the missing ingredients to generate the summary of the recipe
    // Sort them by id, so that both the data from the database and the local information have the same order
    const loadedIngredients = (
      await this.ingredientService.findInList(fetchIngredientsIds.map((entry) => entry[0]))
    ).sort((a, b) => a.id - b.id);

    // Map the loaded ingredients
    loadedIngredients.forEach((ingredient, index) => {
      recipe.ingredients[fetchIngredientsIds[index][1]].ingredient = ingredient;
    });

    recipe.language = data.language;
    recipe.rating = 0;
    // Simply map the RecipeSteps
    recipe.recipeSteps = data.recipeSteps.map<RecipeStepEntity>(
      (step) => new RecipeStepEntity(step),
    );
    recipe.servingSize = data.servingSize;
    recipe.tags = await this.getTagsByIdList(data.tags);
    recipe.imageEntities = await this.getImagesByIdList(data.images);
    recipe.totalTime = data.totalTime;

    recipe.recipeSummary = new RecipeSummaryEntity(
      getRecipeSummaryFromIPortion(recipe.ingredients, recipe.servingSize).summary,
    );

    // Put the object into the database
    recipe = await this.recipeRepository.save(recipe);

    return recipe.id;
  }

  async findById(id: number, userID: number | undefined = undefined): Promise<IRecipe> {
    const recipe = await this.recipeRepository.findOne(id);

    if (recipe == undefined) {
      throw new HttpException({ error: 'ERROR.NOTFOUND' }, 404);
    }

    const favourites: { count: string }[] = await this.recipeRepository.query(
      `SELECT COUNT(*) AS count FROM user_favorites_recipe WHERE "recipeId"=${id}`,
    );
    const ratingAmount: { count: string }[] = await this.userRatingRepository.query(
      `SELECT COUNT(*) AS count FROM rating WHERE "recipeId"=${id}`,
    );

    const rating: UserRatingEntity = await this.userRatingRepository.findOne({
      where: {
        recipe: id,
        user: userID,
      },
    });

    return {
      cookTime: recipe.cookTime,
      creationDate: recipe.creationDate,
      creator: recipe.creator.convertToIUser(),
      difficulty: recipe.difficulty,
      favorites: parseInt(favourites[0].count) || 0,
      ratingAmount: parseInt(ratingAmount[0].count) || 0,
      id: id,
      images: recipe.imageEntities.map((entity) => entity.id),
      ingredients: recipe.ingredients,
      isFavorited: userID == undefined ? false : await this.isFavourited(id, userID),
      userRating: !!rating ? rating.rating : undefined,
      language: recipe.language,
      rating: recipe.rating,
      recipeSteps: recipe.recipeSteps,
      recipeSummary: recipe.recipeSummary,
      servingSize: recipe.servingSize,
      tags: recipe.tags,
      title: recipe.title,
      totalTime: recipe.totalTime,
    };
  }

  async findTagsByName(name: string): Promise<TagEntity[]> {
    return await this.tagRepository.find({ tag: Like(`%${name}%`) });
  }

  async getTagsByIdList(ids: number[]): Promise<TagEntity[]> {
    if (ids.length == 0) {
      return [];
    }
    return await this.tagRepository.findByIds(ids);
  }

  async getImagesByIdList(ids: number[]): Promise<ImagesEntity[]> {
    if (ids.length == 0) {
      return [];
    }
    return await this.imageRepository.findByIds(ids);
  }

  // Get the Creator of a single recipe
  async getOwner(id: number): Promise<UserEntity> {
    return (
      await this.recipeRepository
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.creator', 'user')
        .where('recipe.id = :id', { id })
        .getOne()
    ).creator;
  }

  async delete(id: number): Promise<DeleteResult> {
    // When deleting a Recipe we can also create the custom generated ingredients
    // So we get all ingredient ids and then delete them

    const recipe = await this.recipeRepository.findOne(id);
    const ingredients: number[] = recipe.ingredients.map((ingredient) => ingredient.id);

    // For some reason cascade delete doesn't work, so we manually remove all the connected entities
    await this.recipeRepository.query(`DELETE FROM rating WHERE "recipeId"=${id}`);
    await this.recipeRepository.query(`DELETE FROM user_favorites_recipe WHERE "recipeId"=${id}`);
    await this.imageRepository.remove(recipe.imageEntities);
    await this.portionRepository.remove(recipe.ingredients);
    await this.recipeStepRepository.remove(recipe.recipeSteps);
    await this.recipeSummaryRepository.remove(recipe.recipeSummary);

    if (ingredients.length > 0) await this.ingredientService.deleteUserCreatedList(ingredients);

    // All other properties of recipe are set to delete cascade, so we don't need to delete them manually
    return await this.recipeRepository.delete(id);
  }

  async isFavourited(recipeID: number, userID: number): Promise<boolean> {
    const result: { userId: number; recipeId: number }[] = await this.recipeRepository.query(
      `SELECT * FROM user_favorites_recipe WHERE "userId"=${userID} AND "recipeId"=${recipeID}`,
    );

    return result.length > 0;
  }

  async toggleFavourite(
    recipeID: number,
    userID: number,
  ): Promise<{ success: boolean; result: boolean }> {
    if (await this.isFavourited(recipeID, userID)) {
      await this.recipeRepository
        .createQueryBuilder('recipe')
        .relation('favorites')
        .of(recipeID)
        .remove(userID);
      return { success: true, result: false };
    } else {
      await this.recipeRepository
        .createQueryBuilder('recipe')
        .relation('favorites')
        .of(recipeID)
        .add(userID);
      return { success: true, result: true };
    }
  }

  async rate(recipeID: number, userID: number, rating: number): Promise<{ success: boolean }> {
    // Update or insert
    await this.userRatingRepository.query(
      `INSERT INTO rating ("rating", "userId", "recipeId") VALUES (${rating}, ${userID}, ${recipeID}) ON CONFLICT ( "recipeId", "userId" ) DO UPDATE SET rating = EXCLUDED.rating RETURNING "id"`,
    );

    // get new average
    const averageRating = await this.userRatingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'ratingAverage')
      .where('rating.recipe = :recipeID', { recipeID })
      .getRawOne<{ ratingAverage: number | null }>();

    // Save the new average value
    await this.recipeRepository
      .createQueryBuilder()
      .update()
      .set({ rating: averageRating.ratingAverage || -1 })
      .where('id = :id', { id: recipeID })
      .execute();

    return { success: true };
  }

  async getRating(recipeID: number, userID: number): Promise<{ rating: number | null }> {
    return {
      rating:
        (
          await this.userRatingRepository.findOne({
            where: {
              recipe: recipeID,
              user: userID,
            },
          })
        ).rating || null,
    };
  }

  async generateData(): Promise<void> {
    await this.tagRepository.save(TagList);
  }

  async recalculateRecipeSummary(id: number): Promise<void> {
    const recipe = await this.recipeRepository.findOne(id);

    // To overwrite the old values instead of new ones, save the ids of them
    const summaryId = recipe.recipeSummary.id;
    const nutrientId = recipe.recipeSummary.totalNutritions.id;

    recipe.recipeSummary = new RecipeSummaryEntity(
      getRecipeSummaryFromIPortion(recipe.ingredients, recipe.servingSize).summary,
    );

    recipe.recipeSummary.id = summaryId;
    recipe.recipeSummary.totalNutritions.id = nutrientId;

    await this.recipeRepository.save(recipe);
  }
}
