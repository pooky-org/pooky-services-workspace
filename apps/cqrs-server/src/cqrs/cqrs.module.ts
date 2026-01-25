import { Module } from "@nestjs/common";
import { CqrsModule as DefaultCqrsModule } from "@nestjs/cqrs";
import { MongooseModule } from "src/database/mongoose/mongoose.module";
import { SseModule } from "src/sse/sse.module";
import { CqrsCommandsModule } from "./commands/cqrs-commands.module";
import { allModulesControllers } from "./controllers/modules";
import { ModulesController } from "./controllers/modules.controller";
import { CqrsQueriesModule } from "./queries";

@Module({
	imports: [
		DefaultCqrsModule,
		SseModule,
		MongooseModule,
		CqrsQueriesModule,
		CqrsCommandsModule,
	],
	controllers: [ModulesController, ...allModulesControllers],
})
export class CqrsModule {}
