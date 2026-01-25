import { Controller, Get, Param } from "@nestjs/common";
import {
	type RoomInfo,
	WebSocketSessionService,
} from "./services/web-socket.session.service";

@Controller("websocket-rooms")
export class WebSocketRoomsController {
	constructor(
		private readonly webSocketSessionService: WebSocketSessionService,
	) {}

	@Get()
	getAllRooms(): RoomInfo[] {
		return this.webSocketSessionService.getAllRooms();
	}

	@Get("count")
	getRoomCount(): { count: number } {
		return { count: this.webSocketSessionService.getRoomCount() };
	}

	@Get(":roomId")
	getRoomInfo(@Param("roomId") roomId: string): RoomInfo | null {
		return this.webSocketSessionService.getRoomInfo(roomId);
	}
}
