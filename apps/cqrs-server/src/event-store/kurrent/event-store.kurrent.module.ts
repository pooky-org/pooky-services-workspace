import { type DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
	KURRENT_CONFIG_TOKEN,
	type KurrentConfig,
	kurrentConfig,
} from "./event-store.kurrent.config";
import { KURRENT_TOKEN } from "./event-store.kurrent.constants";
import { EventStoreKurrentService } from "./event-store.kurrent.service";

@Module({})
export class EventStoreKurrentModule {
	static register(): DynamicModule {
		return {
			module: EventStoreKurrentModule,
			imports: [ConfigModule.forFeature(kurrentConfig)],
			providers: [
				{
					provide: EventStoreKurrentService,
					useFactory: (configService: ConfigService) => {
						const config =
							configService.get<KurrentConfig>(KURRENT_CONFIG_TOKEN);

						if (!config?.baseUrl) {
							throw new Error(
								"Kurrent baseUrl configuration is missing. Please provide KURRENT_BASE_URL in your environment variables.",
							);
						}

						return new EventStoreKurrentService(config.baseUrl);
					},
					inject: [ConfigService],
				},
				{
					provide: KURRENT_TOKEN,
					useExisting: EventStoreKurrentService,
				},
			],
			exports: [EventStoreKurrentService, KURRENT_TOKEN],
		};
	}
}
