import { type DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import {
  EVENT_PUBLISHER_CONFIG_TOKEN,
  type KafkaConfig,
  kafkaConfig,
} from './event-publisher.kafka.config';
import { EVENT_PUBLISHER_TOKEN } from './event-publisher.kafka.constants';
import { EventPublisherKafkaService } from './event-publisher.kafka.service';

@Module({})
export class EventPublisherKafkaModule {
  static register(): DynamicModule {
    return {
      module: EventPublisherKafkaModule,
      imports: [ConfigModule.forFeature(kafkaConfig)],
      providers: [
        {
          provide: EventPublisherKafkaService,
          useFactory: (configService: ConfigService) => {
            const config = configService.get<KafkaConfig>(
              EVENT_PUBLISHER_CONFIG_TOKEN,
            );

            if (!config?.baseUrl) {
              throw new Error(
                'Kafka baseUrl configuration is missing. Please provide KAFKA_BASE_URL in your environment variables.',
              );
            }

            const kafkaOptions = {
              brokers: [config.baseUrl],
            };

            const kafka = new Kafka(kafkaOptions);
            return new EventPublisherKafkaService(kafka);
          },
          inject: [ConfigService],
        },
        {
          provide: EVENT_PUBLISHER_TOKEN,
          useExisting: EventPublisherKafkaService,
        },
      ],
      exports: [EventPublisherKafkaService, EVENT_PUBLISHER_TOKEN],
    };
  }
}
