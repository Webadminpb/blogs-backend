import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seed = app.get(SeedService);
  const result = await seed.run();

  console.log('Seed result', result);
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
