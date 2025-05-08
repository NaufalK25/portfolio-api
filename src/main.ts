import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app
    .useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    .enableCors({
      origin: [
        'http://localhost:5173',
        'https://mnaufalk-dashboard.netlify.app',
        'https://muhammad-naufal-kateni.netlify.app',
        'https://naufalkateni.com',
        'https://portfolio-dashboard.naufalkateni.com',
      ],
    });

  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('Rest API for portfolio website')
    .setVersion('3.0.3')
    .addTag('welcome')
    .addTag('auth')
    .addTag('gh-repo')
    .addTag('repo')
    .addTag('repo-name')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'access_token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Portfolio API Docs',
  });

  const configService = new ConfigService();
  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
