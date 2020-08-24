import { collectedIngredients } from '@common/generate/GetIngredients';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { AllergyGroups, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { IAdvancedRecipeSearch } from '@common/Model/Recipe/IAdvacedRecipeSearch';
import { IRecipe } from '@common/Model/Recipe/IRecipe';
import { PiecePortionTypes, PortionTypes, Unit } from '@common/Model/Recipe/Portion';
import { RecipeOrderVariants, TagList } from '@common/Model/Recipe/Recipe';
import { OvenTypes, RecipeStepTypes } from '@common/Model/Recipe/RecipeStep';
import { Roles } from '@common/Model/User';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ImagesEntity } from '@server/images/images.entity';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipesModule } from '@server/recipes/recipes.module';
import { TagEntity } from '@server/recipes/tag.entity';
import { UserEntity } from '@server/user/user.entity';
import { UserModule } from '@server/user/user.module';
import exp from 'constants';
import * as supertest from 'supertest';
import { getConnection, Repository } from 'typeorm';

import ormconfig from '../../ormconfig';

// If this is the first run with docker + typeorm it will need some initial setup time
jest.setTimeout(30000);

describe('Recipes', () => {
  let app: INestApplication;
  let repository: Repository<RecipeEntity>;
  let repositoryIngredient: Repository<IngredientEntity>;
  let repositoryUser: Repository<UserEntity>;
  let repositoryTags: Repository<TagEntity>;
  let repositoryImages: Repository<ImagesEntity>;
  let token: string;
  const Tags: TagEntity[] = [];

  const testUser = new UserEntity({
    username: 'RecipeTest',
    email: 'ingredient@test.com',
    joinDate: new Date(),
    profilePicture: '',
    role: [Roles.User],
  });
  testUser.password = '123456';

  const ingredientList = collectedIngredients.map<IngredientEntity>((data) => {
    const ingredient = new IngredientEntity(data);
    ingredient.nutritions = new NutrientEntity(data.nutritions);

    return ingredient;
  });

  const recipeData: IRecipe = {
    cookTime: 45,
    creationDate: new Date(),
    creator: undefined,
    difficulty: 0.5,
    images: [1],
    favorites: 0,
    ratingAmount: 0,
    isFavorited: false,
    ingredients: [
      {
        instanceType: PortionTypes.Unit,
        amount: 50,
        type: Unit.Gram,
        servingSize: 1,
        ingredient: ingredientList.find((ingredient) => ingredient.name == 'Birne'),
        ingredientNameIndex: 0,
      },
      {
        instanceType: PortionTypes.Unit,
        amount: 80,
        type: Unit.Kilogram,
        servingSize: 1,
        ingredient: ingredientList.find((ingredient) => ingredient.name == 'Pomelo'),
        ingredientNameIndex: 0,
      },
      {
        instanceType: PortionTypes.Piece,
        amount: 2,
        type: PiecePortionTypes.Large,
        servingSize: 1,
        ingredient: ingredientList.find((ingredient) => ingredient.name == 'Ei'),
        ingredientNameIndex: 0,
      },
    ],
    language: AvailableLanguages.German,
    rating: 0,
    recipeSteps: [
      {
        type: RecipeStepTypes.Normal,
        text: 'First Step',
        time: 15,
      },
      {
        type: RecipeStepTypes.Oven,
        text: 'Second Step',
        time: 15,
        payloadNumber: 200,
        payloadType: OvenTypes.Fan,
      },
    ],
    recipeSummary: undefined,
    servingSize: 4,
    tags: [],
    title: 'Eierkuchen',
    totalTime: 80,
  };

  const toFind = {
    name: recipeData.title,
    includeIngredients: [],
    excludeIngredients: [],
    includeCategories: [IngredientCategories.Fruit],
    excludeCategories: [IngredientCategories.Fish],
    veganLevel: Vegan.Vegetarion,
    author: testUser.id,
    maxDifficulty: 1,
    hasTags: [5, 7],
    maxCookTime: 600,
    maxTotalTime: 600,
    minimalRating: 0,
    excludeAllergies: [AllergyGroups.Crustacean],
    language: recipeData.language,
    pageSize: 30,
    lastValue: 0,
    lastId: 0,
    order: RecipeOrderVariants.Favourites,
    ascending: true,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          Object.assign({ autoLoadEntities: true } as TypeOrmModuleOptions, ormconfig, {
            database: 'test',
          }),
        ),
        RecipesModule,
        UserModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    repositoryIngredient = module.get('IngredientEntityRepository');
    repositoryUser = module.get('UserEntityRepository');
    repositoryTags = module.get('TagEntityRepository');
    repositoryImages = module.get('ImagesEntityRepository');
    repository = module.get('RecipeEntityRepository');
    await getConnection().synchronize(true);

    await app.init();
  });

  afterAll(async () => {
    await getConnection().synchronize(true);
    await app.close();
  });

  describe('/recipes/tags endpoint - finding tags', () => {
    it('should show find no tags if there are none', async () => {
      const data = await supertest
        .agent(app.getHttpServer())
        .get('/recipes/tags/NonExistentRandomTag')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.length).toBe(0);
    });

    it('should show find tags if they exist', async () => {
      TagList.forEach((tag) => Tags.push(new TagEntity(tag)));
      await repositoryTags.save(Tags);

      const data = await supertest
        .agent(app.getHttpServer())
        .get('/recipes/tags/Japan')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toStrictEqual([{ id: 6, group: 'Regions', tag: 'Japan' }]);
    });
  });

  describe('/recipes endpoint - creating a recipe', () => {
    it('should be possible to create a recipe and favorite + rate it', async () => {
      const exampleImage = new ImagesEntity();
      exampleImage.path = 'test';
      exampleImage.originalName = 'test.png';
      exampleImage.uploader = testUser;

      await repositoryUser.save(testUser);
      await repositoryImages.save(exampleImage);
      TagList.forEach((tag) => Tags.push(new TagEntity(tag)));
      await repositoryTags.save(Tags);
      await repositoryIngredient.save(ingredientList);

      // Set Up to find now that the ingredients have ids assigned
      toFind.excludeIngredients = [
        ingredientList.find((ingredient) => ingredient.name == 'Kartoffeln').id,
      ];
      toFind.includeIngredients = [
        recipeData.ingredients[0].ingredient.id,
        recipeData.ingredients[2].ingredient.id,
      ];

      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/user/login')
        .send({ email: testUser.email, password: '123456' })
        .set('Accept', 'application/json');
      token = body.token;

      const recipe1 = await supertest
        .agent(app.getHttpServer())
        .post('/recipes')
        .send(
          Object.assign({}, recipeData, {
            // The API accepts only ids as ingredients so we need to map the ingredient instance to an id
            ingredients: recipeData.ingredients.map((ingredient) => {
              return Object.assign({}, ingredient, { ingredient: ingredient.ingredient.id });
            }),
            tags: [7, 5],
          }),
        )
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      if (recipe1.status != 201) {
        Logger.log(recipeData);
        Logger.log(recipe1.body);
      }

      expect(recipe1.status).toBe(201);
      expect(recipe1.body).toStrictEqual({ id: 1, success: true });

      // Check if we are able to favourite and rate a recipe
      const favouriting = await supertest
        .agent(app.getHttpServer())
        .post('/recipes/favorite/1')
        .send()
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(favouriting.status).toBe(201);
      expect(favouriting.body).toStrictEqual({ success: true, result: true });

      const rating = await supertest
        .agent(app.getHttpServer())
        .post('/recipes/rating/1')
        .send({
          rating: 5,
        })
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(rating.status).toBe(201);
      expect(rating.body).toStrictEqual({ success: true });

      const createdRecipe = await repository.findOne(1, { relations: ['favorites'] });

      // Manually pre calculated calories
      expect(createdRecipe.recipeSummary.totalNutritions.calories).toBe(9653.9677);
      expect(createdRecipe).toBeDefined();

      // Confirm the rating and favourite
      expect(createdRecipe.rating).toBe(5);
      expect(createdRecipe.favorites.length).toBe(1);

      // Testing a recipe with a custom ingredient
      const recipe2 = await supertest
        .agent(app.getHttpServer())
        .post('/recipes')
        .send(
          Object.assign({}, recipeData, {
            // The API accepts only ids as ingredients so we need to map the ingredient instance to an id
            ingredients: [
              ...recipeData.ingredients.map((ingredient) => {
                return Object.assign({}, ingredient, {
                  ingredient: ingredient.ingredient.id,
                });
              }),
              {
                instanceType: PortionTypes.Unit,
                amount: 50,
                type: Unit.Drop,
                servingSize: 1,
                newIngredient: {
                  allergies: [],
                  category: IngredientCategories.Miscellaneous,
                  name: 'My first ingredient',
                  vegan: Vegan.Neither,
                },
                ingredientNameIndex: 0,
              },
            ],
          }),
        )
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(recipe2.status).toBe(201);

      expect(recipe2.body).toStrictEqual({ id: 2, success: true });

      const createdRecipe2 = await repository.findOne(2);

      // Manually pre calculated calories
      expect(createdRecipe2.recipeSummary.dataForAll).toBe(false);
      expect(createdRecipe2).toBeDefined();
    });
  });

  describe('/recipes endpoint - finding', () => {
    it('should return exactly one recipe when using all filters fitting for the one put into the database', async () => {
      const data = await supertest
        .agent(app.getHttpServer())
        .post('/recipes/find')
        .send(toFind)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      if (data.status != 201) {
        Logger.log(toFind);
        Logger.log(data.body);
      }

      expect(data.status).toBe(201);

      expect(data.body).toMatchObject({ lastId: 1, lastValue: 1, totalCount: 1 });
      expect(data.body).toHaveProperty('recipes');
      expect(data.body.recipes.length).toBe(1);
    });

    it('should return no vegan results', async () => {
      const params: IAdvancedRecipeSearch = {
        ascending: false,
        order: RecipeOrderVariants.Calories,
        pageSize: 25,
      };
      const data = await supertest
        .agent(app.getHttpServer())
        .post('/recipes/find')
        .send(Object.assign({ veganLevel: Vegan.Vegan }, params))
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(data.status).toBe(201);

      expect(data.body).toMatchObject({ totalCount: 0 });
      expect(data.body).toHaveProperty('recipes');
      expect(data.body.recipes.length).toBe(0);
    });

    it('should 2 results total', async () => {
      const params: IAdvancedRecipeSearch = {
        ascending: false,
        order: RecipeOrderVariants.Rating,
        pageSize: 25,
      };
      const data = await supertest
        .agent(app.getHttpServer())
        .post('/recipes/find')
        .send(params)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(data.status).toBe(201);

      expect(data.body).toMatchObject({ lastId: 2, lastValue: 0, totalCount: 2 });
      expect(data.body).toHaveProperty('recipes');
      expect(data.body.recipes.length).toBe(2);
    });

    it('no results when using pagination but return 2 total results', async () => {
      const params: IAdvancedRecipeSearch = {
        ascending: true,
        lastId: 2,
        lastValue: 5,
        order: RecipeOrderVariants.Rating,
        pageSize: 25,
      };
      const data = await supertest
        .agent(app.getHttpServer())
        .post('/recipes/find')
        .send(params)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(data.status).toBe(201);

      expect(data.body).toMatchObject({ lastId: 2, lastValue: 5, totalCount: 2 });
      expect(data.body).toHaveProperty('recipes');
      expect(data.body.recipes.length).toBe(0);
    });

    it('one complete recipe when specifically requesting it', async () => {
      const data = await supertest
        .agent(app.getHttpServer())
        .get('/recipes/1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);

      expect(data.status).toBe(200);
    });
  });

  describe('/recipes endpoint - deleting', () => {});
});
