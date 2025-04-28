import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cron from 'node-cron';
import { UpdateBaseService } from './update-base/update-base.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }); // Active CORS autorise tout le monde pour toutes les methodes
  const updateBaseService = app.get(UpdateBaseService);
/*
 * = day of week
 * * = month
 * * * = day of month
 * * * * = hour
 * * * * * = minute
 * * * * * * = second ( optional ) 
 */
cron.schedule('59 23 * * *', async function() {
  await updateBaseService.retrieveBase();
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
