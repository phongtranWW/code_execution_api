import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { AppModule } from './../src/app.module';
import { User } from '@users/user.entity';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Language } from '@definitions/types/language';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Cache } from '@nestjs/cache-manager';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let configService: ConfigService;
  let cacheManager: Cache;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const jwtService = app.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ username: 'testuser', sub: 1 });
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));
    configService = app.get<ConfigService>(ConfigService);
    cacheManager = app.get<Cache>(Cache);

    const salt = genSaltSync(10);
    const hash = hashSync('testpassword', salt);
    await userRepository.save({ username: 'testuser', hash, salt });
  });

  afterAll(async () => {
    await userRepository.delete({ username: 'testuser' });
    await app.close();
  });

  describe('POST /users/auth/login', () => {
    it('should login successfully', async () => {
      return await request(app.getHttpServer())
        .post('/users/auth/login')
        .set('x-api-key', configService.get<string>('api.key'))
        .send({ username: 'testuser', password: 'testpassword' })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toEqual(expect.any(String));
        });
    });

    it('should login fail', async () => {
      return await request(app.getHttpServer())
        .post('/users/auth/login')
        .set('x-api-key', configService.get<string>('api.key'))
        .send({ username: 'testuser', password: 'testpassworddd' })
        .expect(401);
    });
  });

  describe('POST /users/auth/register', () => {
    it('should register successfully', async () => {
      return await request(app.getHttpServer())
        .post('/users/auth/register')
        .set('x-api-key', configService.get<string>('api.key'))
        .send({ username: 'testuser1', password: 'testpassword1' })
        .expect(201);
    });

    it('should register fail', async () => {
      return await request(app.getHttpServer())
        .post('/users/auth/register')
        .set('x-api-key', configService.get<string>('api.key'))
        .send({ username: 'testuser', password: 'testpassword1' })
        .expect(409);
    });

    afterAll(async () => {
      await userRepository.delete({ username: 'testuser1' });
    });
  });

  describe('GET /users/testuser/codes/:language', () => {
    afterAll(async () => {
      await cacheManager.del(`testuser:${Language.JAVA}`);
    });

    it('should get codes successfully', async () => {
      const sourceCode = join(__dirname, 'sources', 'Error.java');
      await cacheManager.set(
        `testuser:${Language.JAVA}`,
        await readFileSync(sourceCode, 'utf-8'),
      );

      return await request(app.getHttpServer())
        .get(`/users/testuser/codes?language=${Language.JAVA}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .expect(200)
        .expect(async (res) => {
          expect(res.body.contents).toEqual(
            await readFileSync(sourceCode, 'utf-8'),
          );
        });
    });

    it('should throw not found exception', async () => {
      return await request(app.getHttpServer())
        .get(`/users/testuser/codes?language=${Language.PYTHON}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .expect(404);
    });

    it('should throw forbidden exception', async () => {
      return await request(app.getHttpServer())
        .get(`/users/testuserss/codes?language=${Language.PYTHON}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .expect(403);
    });
  });
});
