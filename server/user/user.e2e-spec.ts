import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { getConnection, Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { UserModule } from './user.module';
import ormconfig from '../../ormconfig';
import { IUser, Roles } from '../../common/Model/User';

describe('User', () => {
  let app: INestApplication;
  let repository: Repository<UserEntity>;
  const userData: IUser = {
    email: 'test@test.com',
    joinDate: new Date(),
    profilePicture: '',
    role: [Roles.User],
    username: 'testUser1',
  };

  const User1 = new UserEntity(userData);
  User1.password = '123456';

  const User2 = new UserEntity(
    Object.assign({}, userData, {
      email: 'test@example.com',
      username: 'testUser2',
      role: [Roles.User, Roles.Owner],
    }),
  );
  User2.password = 'abcdefg';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(
          Object.assign({ autoLoadEntities: true } as TypeOrmModuleOptions, ormconfig, {
            database: 'test',
          }),
        ),
        UserModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    repository = module.get('UserEntityRepository');
    await getConnection().synchronize(true);

    await app.init();
  });

  afterEach(async () => {
    await repository.query(`DELETE FROM "user";`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user with no account', () => {
    it('should throw an error when getting their own account', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.UNAUTHORIZED);
      expect(body).toEqual({ message: 'You need to be logged in to do that.' });
    });

    it('wrong data should throw an error', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/user')
        .send({
          wrong: true,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not be able to create a new account with the same username', async () => {
      await repository.save(User1);
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/user')
        .send({
          username: userData.username,
          email: 'newmail@mail.com',
          password: 'Kartoffelpuffer',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.BAD_REQUEST);
      expect(body).toEqual({
        message: 'Account creation failed. - Username or email already exist.',
      });
    });

    it('should be able to create a new account', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/user')
        .send({
          username: 'Iamanewuser',
          email: 'newmail@mail.com',
          password: 'Kartoffelpufferkuchen',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.CREATED);
      expect(body).toMatchObject({
        email: 'newmail@mail.com',
        profilePicture: '',
        role: [0],
        username: 'Iamanewuser',
      });

      expect((await repository.findOne({ username: 'Iamanewuser' })).email).toBe(
        'newmail@mail.com',
      );
    });
  });

  describe('/user with an account', () => {
    it('should be able to login, get his account and then delete it', async () => {
      await repository.save(User1);
      const data = await supertest
        .agent(app.getHttpServer())
        .post('/user/login')
        .send({ email: User1.email, password: '123456' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.CREATED);

      const info: any = User1.convertToIUser();
      info.joinDate = info.joinDate.toISOString();

      expect(data.body).toMatchObject(info);
      expect(data.body).toHaveProperty('token');

      const data2 = await supertest
        .agent(app.getHttpServer())
        .delete('/user')
        .set('Authorization', 'Bearer ' + data.body.token)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(HttpStatus.OK);

      expect(data2.body).toStrictEqual({ success: true });

      const databaseResult = await repository.findOne({ username: User1.username });

      expect(databaseResult).toBeUndefined();
    });
  });

  it('admin should be able to delete the accounts of others', async () => {
    const username = 'testUser3';
    await repository.save([
      User2,
      new UserEntity(
        Object.assign({}, userData, {
          email: 'test2@example.com',
          username: username,
          password: 'potato',
        }),
      ),
    ]);
    const data = await supertest
      .agent(app.getHttpServer())
      .post('/user/login')
      .send({ email: User2.email, password: 'abcdefg' });

    const data2 = await supertest
      .agent(app.getHttpServer())
      .delete('/user/' + username)
      .set('Authorization', 'Bearer ' + data.body.token)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(HttpStatus.OK);

    expect(data2.body).toStrictEqual({ success: true });

    const databaseResult = await repository.findOne({ username: username });

    expect(databaseResult).toBeUndefined();
  });
});
