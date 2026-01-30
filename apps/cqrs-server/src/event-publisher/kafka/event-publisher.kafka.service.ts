import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, Producer } from "kafkajs";

@Injectable()
export class EventPublisherKafkaService
	implements OnModuleInit, OnModuleDestroy
{
	readonly publisher: Producer;

	constructor(publisher: Kafka) {
		this.publisher = publisher.producer();
	}

	async onModuleInit() {
		await this.publisher.connect();
	}

	async onModuleDestroy() {
		await this.publisher.disconnect();
	}

	async publishEvent(topic: string, message: string): Promise<void> {
		await this.publisher.send({
			topic,
			messages: [
				{
					value: message,
				},
			],
		});
	}
}
