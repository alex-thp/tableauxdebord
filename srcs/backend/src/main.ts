import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cron from 'node-cron';
import { UpdateBaseService } from './services/update-base/update-base.service';
import { MajQpvService } from './services/maj-qpv/maj-qpv.service';
import * as bodyParser from 'body-parser'; // import body-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Increase request body size limit to 10mb
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }); // Active CORS autorise tout le monde pour toutes les methodes
  const updateBaseService = app.get(UpdateBaseService);
  const majQpvService = app.get(MajQpvService);
  /*
   * = day of week
   * * = month
   * * * = day of month
   * * * * = hour
   * * * * * = minute
   * * * * * * = second ( optional )
   */
  cron.schedule(
    '59 23 * * *',
    async function () {
      console.log('⚙️ Cron lancé à 23h59');
      await updateBaseService.retrieveBase();
      await majQpvService.majQPVFunction();
    },
    {
      timezone: 'Europe/Paris',
    },
  );
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
