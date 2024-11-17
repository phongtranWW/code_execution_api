import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ExecutionStatus } from '@executions/dtos/execution-result.dto';
import { join } from 'path';
import { Language } from '@definitions/types/language';
import { ConfigService } from '@nestjs/config';
import { Cache } from '@nestjs/cache-manager';
import { readFileSync } from 'fs';

describe('ExecutionsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let configService: ConfigService;
  let cacheManager: Cache;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const jwtService = app.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ username: 'testuser', sub: 1 });
    configService = app.get<ConfigService>(ConfigService);
    cacheManager = app.get<Cache>(Cache);
  });

  afterAll(async () => {
    await cacheManager.reset();
    await app.close();
  });

  describe('POST /executions?language=', () => {
    it('should execute java code successfully', async () => {
      const sourceCode = join(__dirname, 'sources', 'Main.java');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.JAVA}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect(async () => {
          expect(await cacheManager.get(`testuser:${Language.JAVA}`)).toEqual(
            await readFileSync(sourceCode, 'utf-8'),
          );
        })
        .expect((res) => {
          expect(res.body.contents).toContain('Hello, World!');
          expect(res.body.status).toEqual(ExecutionStatus.SUCCESS);
        });
    });

    it('should execute error java code', async () => {
      const sourceCode = join(__dirname, 'sources', 'Error.java');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.JAVA}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toEqual(ExecutionStatus.ERROR);
        });
    });

    it('should execute js code successfully', async () => {
      const sourceCode = join(__dirname, 'sources', 'main.js');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.JS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.contents).toContain('Hello, World!');
          expect(res.body.status).toEqual(ExecutionStatus.SUCCESS);
        });
    });

    it('should execute error js code', async () => {
      const sourceCode = join(__dirname, 'sources', 'error.js');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.JS}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toEqual(ExecutionStatus.ERROR);
        });
    });

    it('should execute cpp code successfully', async () => {
      const sourceCode = join(__dirname, 'sources', 'main.cpp');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.CPP}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.contents).toContain('Hello, World!');
          expect(res.body.status).toEqual(ExecutionStatus.SUCCESS);
        });
    });

    it('should execute error cpp code', async () => {
      const sourceCode = join(__dirname, 'sources', 'error.cpp');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.CPP}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toEqual(ExecutionStatus.ERROR);
        });
    });

    it('should execute python code successfully', async () => {
      const sourceCode = join(__dirname, 'sources', 'main.py');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.PYTHON}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.contents).toContain('Hello, World!');
          expect(res.body.status).toEqual(ExecutionStatus.SUCCESS);
        });
    });

    it('should execute error python code', async () => {
      const sourceCode = join(__dirname, 'sources', 'error.py');

      return await request(app.getHttpServer())
        .post(`/executions?language=${Language.PYTHON}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toEqual(ExecutionStatus.ERROR);
        });
    });

    it('should unauthorized', async () => {
      const accessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const sourceCode = join(__dirname, 'sources', 'Main.java');

      return await request(app.getHttpServer())
        .post('/executions?language=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('x-api-key', configService.get<string>('api.key'))
        .attach('sourceCode', sourceCode)
        .expect(401);
    });
  });
});
