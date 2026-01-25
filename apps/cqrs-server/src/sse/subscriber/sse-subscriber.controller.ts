import { Body, Controller, Logger, Post } from "@nestjs/common";
import type { SubscribeDto } from "./dto/subscribe.dto";
import { SseSubscriberService } from "./sse-subscriber.service";

@Controller("sse")
export class SseSubscriberController {
	private readonly logger = new Logger(SseSubscriberController.name);

	constructor(private readonly sseSubscriberService: SseSubscriberService) {}

	@Post("subscribe")
	subscribeToSse(@Body() body: SubscribeDto) {
		try {
			this.sseSubscriberService.addClient(body.clientId);
			this.logger.verbose("Client subscribed:", body.clientId);
		} catch (error) {
			this.logger.error("Error subscribing client:", error);
		}
	}

	@Post("unsubscribe")
	unsubscribeFromSse(@Body() body: SubscribeDto) {
		this.sseSubscriberService.removeClient(body.clientId);
		this.logger.verbose("Client unsubscribed:", body.clientId);
	}
}
