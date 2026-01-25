import { Module } from "@nestjs/common";
import { WebSocketSessionService } from "./services/web-socket.session.service";
import { WebSocketRoomsController } from "./web-socket-rooms.controller";
import { WebSocketGateway } from "./web-socket.gateway";

@Module({
	controllers: [WebSocketRoomsController],
	providers: [WebSocketGateway, WebSocketSessionService],
})
export class WebSocketModule {}
