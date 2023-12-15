import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('Rest API for portfolio website')
    .setVersion('3.0.3')
    .addTag('welcome')
    .addTag('repo')
    .addTag('repo-name')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Portfolio API Docs',
  });

  const configService = new ConfigService();
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
