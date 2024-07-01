import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const logger = new Logger('Payments-ms')

  const app = await NestFactory.create(AppModule, {
    rawBody: true // stripe pide el body en su forma pura
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers
    }
  })

  await app.startAllMicroservices()
  await app.listen(envs.port);

  logger.log(`Payments Microservice running on port ${envs.port}`)
}
bootstrap();
