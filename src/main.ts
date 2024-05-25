import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userRepo = app.get(AuthService);
  await userRepo.createAdminUserIfNotExists();
  const config = new DocumentBuilder()
    .setTitle('Shopping app apis')
    .setDescription('Here are all the shopping app api documentation')
    .setVersion('1.0')
    // .addTag('')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apis', app, document);

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
}
bootstrap();
