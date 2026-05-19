import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173"],
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port);
  Logger.log(`tenant-service listening on :${port}`, "Bootstrap");
}

bootstrap().catch((err) => {
  console.error("tenant-service failed to start", err);
  process.exit(1);
});
