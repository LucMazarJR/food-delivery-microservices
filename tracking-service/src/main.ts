import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Tracking Service')
    .setDescription('Rastreamento em tempo real de entregadores via WebSocket.')
    .setVersion('1.0')
    .addTag('Tracking', 'Localização em tempo real')
    .build();

  SwaggerModule.setup('api', app, () => SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
