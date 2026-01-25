import { Module } from "@nestjs/common";
import { SseSubscriberController } from "./subscriber/sse-subscriber.controller";
import { SseSubscriberService } from "./subscriber/sse-subscriber.service";

@Module({
	controllers: [SseSubscriberController],
	providers: [SseSubscriberService],
	exports: [SseSubscriberService],
})
export class SseModule {}
