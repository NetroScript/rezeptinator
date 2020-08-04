import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { getConnection, Repository } from 'typeorm';

import { IngredientEntity } from './ingredient.entity';
import { IngredientModule } from './ingredient.module';

import ormconfig from '../../ormconfig';
import { UserEntity } from '@server/user/user.entity';
import { Roles } from '@common/Model/User';
import { AllergyGroups, IIngredient, IngredientCategories, Vegan } from '@common/Model/Ingredient';
import { NutrientEntity } from '@server/ingredient/nutrient.entity';
import { UserModule } from '@server/user/user.module';

// If this is the first run with docker + typeorm it will need some initial setup time
jest.setTimeout(30000);

describe('Ingredients', () => {
  let app: INestApplication;
  let repository: Repository<IngredientEntity>;
  let repositoryUser: Repository<UserEntity>;
  let token: string;

  const testUser = new UserEntity({
    username: 'Ingredeinttest',
    email: 'ingredient@test.com',
    joinDate: new Date(),
    profilePicture: '',
    role: [Roles.User, Roles.Admin, Roles.Owner],
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

  const ingredient1 = new IngredientEntity(ingredientData);
  ingredient1.nutritions = new NutrientEntity(ingredientData.nutritions);

  const ingredient2 = new IngredientEntity(Object.assign({}, ingredientData, { name: 'NussTest' }));
  ingredient2.nutritions = new NutrientEntity(ingredientData.nutritions);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          Object.assign({ autoLoadEntities: true } as TypeOrmModuleOptions, ormconfig, {
            database: 'test',
          }),
        ),
        IngredientModule,
        UserModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    repository = module.get('IngredientEntityRepository');
    repositoryUser = module.get('UserEntityRepository');
    await getConnection().synchronize(true);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await repository.query(`DELETE FROM "ingredient";`);
    await repository.query(`DELETE FROM "user";`);
  });

  describe('/ingredient endpoint - creating ingredients', () => {
    it('should be able to create ingredients when logged in', async () => {
      await repositoryUser.save(testUser);

      const user = await supertest
        .agent(app.getHttpServer())
        .post('/user/login')
        .send({ email: testUser.email, password: '123456' })
        .set('Accept', 'application/json');

      const data2 = await supertest
        .agent(app.getHttpServer())
        .post('/ingredients')
        .send(ingredientData)
        .set('Authorization', 'Bearer ' + user.body.token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      const ingredient = await repository.findOne({ name: ingredientData.name });

      expect(ingredient).not.toBeUndefined();

      expect(data2.body).toMatchObject(ingredientData);

      token = user.body.token;

      await supertest
        .agent(app.getHttpServer())
        .post('/ingredients')
        .send(Object.assign({}, ingredientData, { name: 'Kartoffelnuss' }))
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);
    });
  });

  describe('/ingredient endpoint - finding', () => {
    it('should show that there are 2 ingredients now', async () => {
      const data = await supertest
        .agent(app.getHttpServer())
        .get('/ingredients')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.length).toBe(2);
    });

    it('should show that if you search for Nuss you find 2 ingredients', async () => {
      const data = await supertest
        .agent(app.getHttpServer())
        .get('/ingredients/nuss')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.length).toBe(2);
    });
  });

  describe('/ingredient endpoint - deleting', () => {
    it('should delete an ingredient if an admin requests it', async () => {
      const data = await supertest
        .agent(app.getHttpServer())
        .delete('/ingredients/1')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .expect('Content-Type', /json/)
        .expect(HttpStatus.OK);

      expect(data.body).toStrictEqual({ success: true });

      const databaseResult = await repository.findOne({ id: 1 });

      expect(databaseResult).toBeUndefined();
    });
  });
});
