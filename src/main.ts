import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const configService = app.get<ConfigService>(ConfigService);
  const apiPrefix = configService.get<string>('api.prefix');
  const apiVersion = configService.get<string>('api.version');
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  const config = new DocumentBuilder()
    .setTitle('Online Code Execution API')
    .setDescription(
      'This API can execute code in different languages (cpp, java, python, js).',
    )
    .setVersion(apiVersion)
    .addBearerAuth()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'x-api-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/${apiVersion}/docs`, app, document);

  await app.listen(configService.get('api.port'));
}
bootstrap();
