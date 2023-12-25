import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';

describe('App', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const moduleRed = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRed.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prismaService = app.get<PrismaService>(PrismaService);
    await prismaService.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    const body: AuthDto = {
      email: 'thao@gmail.com',
      password: '123',
    };
    describe('Sign Up', () => {
      it('should throw error if email empty', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...body, email: '' })
          .expectStatus(400);
      });
      it('should throw error if password empty', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...body, password: '' })
          .expectStatus(400);
      });
      it('should throw error if email invalid', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody({ ...body, email: 'thao' })
          .expectStatus(400);
      });
      it('should throw error if no body is provided', async () => {
        await pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signUp', async () => {
        await pactum
          .spec()
          .post('/auth/signup')
          .withBody(body)
          .expectStatus(201);
      });
    });
    describe('Sign In', () => {
      it('should signIn', async () => {
        await pactum
          .spec()
          .post('/auth/signin')
          .withBody(body)
          .expectStatus(200)
          .stores('access_token', 'access_token');
      });
      it('should throw error if email empty', async () => {
        await pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...body, email: '' })
          .expectStatus(400);
      });
      it('should throw error if password empty', async () => {
        await pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...body, password: '' })
          .expectStatus(400);
      });
      it('should throw error if email invalid', async () => {
        await pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...body, email: 'thao' })
          .expectStatus(400);
      });
      it('should throw error if no body is provided', async () => {
        await pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should throw error if email not found', async () => {
        await pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...body, email: 'dd@ggg.com' })
          .expectStatus(401);
      });
      it('should throw error if password is invalid', async () => {
        await pactum
          .spec()
          .post('/auth/signin')
          .withBody({ ...body, password: '1234' })
          .expectStatus(401);
      });
    });
  });
  describe('Users', () => {
    describe('Get me', () => {
      it('should throw error if no token is provided', async () => {
        await pactum.spec().get('/users/me').expectStatus(401);
      });
      it('should throw error if token is invalid', async () => {
        await pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer 123',
          })
          .expectStatus(401);
      });
      it('should return user', async () => {
        await pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should throw error if no token is provided', async () => {
        await pactum.spec().patch('/users').expectStatus(401);
      });
      it('should update lastName', async () => {
        const body: EditUserDto = {
          lastName: 'abc' + Math.random(),
        };
        await pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody(body)
          .expectStatus(200)
          .expectBodyContains(body.lastName);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty bookmarks from user', () => {
      it('should return empty array', async () => {
        await pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      it('should throw error if no token is provided', async () => {
        await pactum.spec().post('/bookmarks').expectStatus(401);
      });
      it('should throw error if no body is provided', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(400);
      });
      it('should throw error if title is empty', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody({
            link: 'https://google.com',
            title: '',
          })
          .expectStatus(400);
      });
      it('should create bookmark', async () => {
        await pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody({
            link: 'https://google.com',
            title: 'Google',
          })
          .expectStatus(201)
          .stores('bookmark_id', 'id');
      });
    });
    describe('Get all bookmarks from user', () => {
      it('should throw error if no token is provided', async () => {
        await pactum.spec().get('/bookmarks').expectStatus(401);
      });
      it('should return bookmarks', async () => {
        await pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200)
          .expectBodyContains('Google');
      });
    });
    describe('Update bookmark', () => {
      it('should throw error if no token is provided', async () => {
        await pactum
          .spec()
          .patch('/bookmarks/$S{bookmark_id}')
          .expectStatus(401);
      });
      it('should update bookmark', async () => {
        await pactum
          .spec()
          .patch('/bookmarks/$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .withBody({
            title: 'Google 2',
          })
          .expectStatus(200)
          .expectBodyContains('Google 2');
      });
    });
    describe('Delete bookmark', () => {
      it('should throw error is bookmark not found', async () => {
        await pactum
          .spec()
          .delete('/bookmarks/$S{bookmark_id}2')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(404);
      });
      it('should delete bookmark', async () => {
        await pactum
          .spec()
          .delete('/bookmarks/$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(204);
      });
      it('should return empty array as bookmarks', async () => {
        await pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{access_token}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
