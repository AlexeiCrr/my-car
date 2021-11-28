import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const user = {
      email: 'test6@test.com',
      password: 'password'
    };

    return request(app.getHttpServer())
      .post('/users/signup')
      .send(user)
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(user.email);
      });
  });

  // it('signup as a new user then get the currently logged user', async () => {
  //   const user = {
  //     email: 'test6@test.com',
  //     password: 'password'
  //   };

  //   const res = await request(app.getHttpServer())
  //     .post('/users/signup')
  //     .send(user)
  //     .expect(201);

  //   const cookie = res.get('Set-Cookie');

  //   const { body } = await request(app.getHttpServer())
  //     .get('/users/whoami')
  //     .set('Cookie', cookie)
  //     .expect(200);

  //   console.log(body);
  //   expect(body.email).toEqual(user.email);
  // });
});
