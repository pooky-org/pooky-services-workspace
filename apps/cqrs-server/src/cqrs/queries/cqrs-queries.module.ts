import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RedisModule } from "src/cache/redis";
import { RssParserModule } from "src/rss/parser/rss-parser.module";
import {
	ModuleSchema as ModuleMongooseSchema,
	Module as ModuleSchema,
} from "../../database/schemas/module.schema";
import { allModulesHandlers, GetAllModulesHandler } from "./handlers";

@Module({
	imports: [
		RedisModule,
		RssParserModule,
		MongooseModule.forFeature([
			{ name: ModuleSchema.name, schema: ModuleMongooseSchema },
		]),
	],
	providers: [GetAllModulesHandler, ...allModulesHandlers],
	exports: [GetAllModulesHandler, ...allModulesHandlers],
})
export class CqrsQueriesModule {}
