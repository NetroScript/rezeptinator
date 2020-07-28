import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ApplicationModule } from './../server/application.module';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/ping').expect(200).expect('pong');
  });
});
