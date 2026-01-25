import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "./cqrs/cqrs.module";
import { WebSocketModule } from "./web-socket/web-socket.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		// EventPublisherKafkaModule.register(),
		// EventStoreKurrentModule.register(),
		CqrsModule,
		WebSocketModule,
	],
})
export class AppModule {}
