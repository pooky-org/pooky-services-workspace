import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const globalPrefix = "api";
	app.setGlobalPrefix(globalPrefix);
	const port = process.env.PORT || 3000;

	app.enableCors();

	const config = new DocumentBuilder()
		.setTitle("Pooky API")
		.setDescription("You can have access to all the endpoints of Pooky API")
		.setVersion("1.0")
		.build();
	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, documentFactory);

	app.useGlobalPipes(new ValidationPipe());

	await app.listen(port);
	Logger.log(
		`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
	);
}

bootstrap();
