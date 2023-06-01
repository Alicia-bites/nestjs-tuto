import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strip out elements not defined in dto. So if someone tries to add a field not defined in dto, it won't be added
  }));
  await app.listen(3333);
}
bootstrap();
