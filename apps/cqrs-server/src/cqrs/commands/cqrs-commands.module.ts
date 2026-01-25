import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
	ModuleSchema as ModuleMongooseSchema,
	Module as ModuleSchema,
} from "../../database/schemas/module.schema";
import { CreateModuleHandler } from "./handlers/create-module.handler";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ModuleSchema.name, schema: ModuleMongooseSchema },
		]),
	],
	providers: [CreateModuleHandler],
	exports: [CreateModuleHandler],
})
export class CqrsCommandsModule {}
