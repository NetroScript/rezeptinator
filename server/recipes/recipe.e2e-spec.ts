import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { getConnection, Repository } from 'typeorm';

import ormconfig from '../../ormconfig';
import { UserEntity } from '@server/user/user.entity';
import { Roles } from '@common/Model/User';
import { AllergyGroups, IIngredient, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { UserModule } from '@server/user/user.module';
import { RecipeEntity } from '@server/recipes/recipe.entity';
import { RecipesModule } from '@server/recipes/recipes.module';
import { IngredientEntity } from '@server/ingredient/ingredient.entity';
import { IRecipe, TagList } from '@common/Model/Recipe';
import { TagEntity } from '@server/recipes/tag.entity';
import { AvailableLanguages } from '@common/Localisation/Generic';
import { collectedIngredients } from '@common/generate/GetIngredients';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { OvenTypes, RecipeStepTypes } from '@common/Model/RecipeStep';
import { PiecePortionTypes, PortionTypes, Unit } from '@common/Model/Portion';
import { PiecePortion } from '@common/Classes/PiecePortion';

// If this is the first run with docker + typeorm it will need some initial setup time
jest.setTimeout(30000);

describe('Recipes', () => {
  let app: INestApplication;
  let repository: Repository<RecipeEntity>;
  let repositoryIngredient: Repository<IngredientEntity>;
  let repositoryUser: Repository<UserEntity>;
  let repositoryTags: Repository<TagEntity>;
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

  const ingredientData: IIngredient = {
    alias: [],
    allergies: [AllergyGroups.Nuts],
    category: IngredientCategories.Nuts,
    name: 'Testnuss',
    nutritions: {
      calories: 635,
      protein: 12,
      fat: 61,
      carbs: 5.8,
      sugar: 1,
      fibers: 7.4,
      alcohol: 0,
    },
    portionSize: 0,
    vegan: Vegan.Vegan,
  };

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
    favourites: 0,
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
        .get('/recipes/tags/NonExistantRandomTag')
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
    it('should be possible to create a recipe', async () => {
      await repositoryUser.save(testUser);
      TagList.forEach((tag) => Tags.push(new TagEntity(tag)));
      await repositoryTags.save(Tags);
      await repositoryIngredient.save(ingredientList);

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
              const data = Object.assign({}, ingredient, { ingredient: ingredient.ingredient.id });
              return data;
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

      const createdRecipe = await repository.findOne(1);

      // Manually pre calculated calories
      expect(createdRecipe.recipeSummary.totalNutritions.calories).toBe(9653.9677);
      expect(createdRecipe).toBeDefined();

      // Testing a recipe with a custom ingredient
      const recipe2 = await supertest
        .agent(app.getHttpServer())
        .post('/recipes')
        .send(
          Object.assign({}, recipeData, {
            // The API accepts only ids as ingredients so we need to map the ingredient instance to an id
            ingredients: [
              ...recipeData.ingredients.map((ingredient) => {
                const data = Object.assign({}, ingredient, {
                  ingredient: ingredient.ingredient.id,
                });
                return data;
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

  describe('/recipes endpoint - finding', () => {});

  describe('/recipes endpoint - deleting', () => {});
});
