import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule as MongooseDefaultModule } from "@nestjs/mongoose";

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseDefaultModule.forRoot(process.env.MONGODB_URI || ""),
	],
})
export class MongooseModule {}
