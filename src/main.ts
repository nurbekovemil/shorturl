import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT
  const HOST = process.env.HOST
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT, HOST);
  console.log(`Server running at http://${HOST}:${PORT}`);  
}
bootstrap();
