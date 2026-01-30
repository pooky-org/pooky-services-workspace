import { registerAs } from "@nestjs/config";

export const EVENT_PUBLISHER_CONFIG_TOKEN = Symbol("EventPublisherConfig");

export interface KafkaConfig {
	baseUrl?: string;
}

export const kafkaConfig = registerAs(
	EVENT_PUBLISHER_CONFIG_TOKEN,
	(): KafkaConfig => {
		return {
			baseUrl: process.env["KAFKA_BASE_URL"],
		};
	},
);
