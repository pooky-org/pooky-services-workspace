import { Logger } from "@nestjs/common";
import {
	type OnGatewayConnection,
	type OnGatewayDisconnect,
	type OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway as WebSocketGatewayDecorator,
	WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { Gesture } from "./enums/gesture.enum";
import { WebSocketProfile } from "./enums/web-socket-profile.enum";
import { WebSocketSessionService } from "./services/web-socket.session.service";

@WebSocketGatewayDecorator({
	path: "/ws",
	cors: {
		origin: "*",
	},
})
export class WebSocketGateway
	implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	private readonly logger = new Logger(WebSocketGateway.name);

	@WebSocketServer()
	server: Server;

	constructor(
		private readonly webSocketSessionService: WebSocketSessionService,
	) {}

	afterInit(server: Server) {
		this.webSocketSessionService.setServer(server);
		this.webSocketSessionService.clearAllRooms();
		this.logger.log("WebSocket gateway initialized");
	}

	handleConnection(client: Socket) {
		this.logger.verbose(`Client connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.verbose(`Client disconnected: ${client.id}`);

		// Handle disconnection - just mark as disconnected, don't delete rooms
		const { disconnectedSessions } =
			this.webSocketSessionService.handleClientDisconnection(client.id);

		// Notify other participants about disconnections
		for (const { roomId, sessionId, profile } of disconnectedSessions) {
			client.to(roomId).emit("participantDisconnected", {
				sessionId,
				profile,
				disconnectedAt: new Date(),
			});
		}
	}

	@SubscribeMessage("createRoom")
	handleCreateRoom(client: Socket, payload: { sessionId: string }): void {
		const { sessionId } = payload;
		const roomId = uuidv4(); // Generate roomId automatically
		client.join(roomId);

		// Creator automatically becomes the HOST
		this.webSocketSessionService.createRoom(roomId, client.id, sessionId);

		this.logger.verbose(
			`Room ${roomId} created by client: ${client.id} (session: ${sessionId}) as HOST`,
		);

		// Broadcast the room creation event
		this.server.emit("roomCreated", {
			roomId,
			clientId: client.id,
			sessionId,
			profile: WebSocketProfile.HOST,
		});
	}

	@SubscribeMessage("reconnect")
	handleReconnect(client: Socket, payload: { sessionId: string }): void {
		const { sessionId } = payload;

		const reconnectionResult = this.webSocketSessionService.reconnectSession(
			sessionId,
			client.id,
		);

		if (reconnectionResult.success && reconnectionResult.roomId) {
			const { roomId, profile } = reconnectionResult;
			client.join(roomId);

			client.emit("reconnected", {
				roomId,
				clientId: client.id,
				sessionId,
				profile,
			});

			// Notify other clients in the room that this session reconnected
			client.to(roomId).emit("participantReconnected", {
				sessionId,
				clientId: client.id,
				profile,
				reconnectedAt: new Date(),
			});

			this.logger.verbose(
				`Session ${sessionId} reconnected as ${client.id} in room ${roomId}`,
			);
		} else {
			client.emit("reconnectionFailed", {
				message: "Cannot reconnect. Session not found or already connected.",
			});
		}
	}

	@SubscribeMessage("joinRoom")
	handleJoinRoom(
		client: Socket,
		payload: { roomId: string; sessionId: string },
	): void {
		const { roomId, sessionId } = payload;
		const room = this.server.sockets.adapter.rooms.get(roomId);

		if (room) {
			client.join(roomId);

			// Joiners automatically become GUEST
			this.webSocketSessionService.addClientToRoom(
				roomId,
				client.id,
				sessionId,
				WebSocketProfile.GUEST,
			);

			client.emit("roomJoined", {
				roomId,
				clientId: client.id,
				sessionId,
				profile: WebSocketProfile.GUEST,
			});

			// Notify other clients in the room about the new participant
			client.to(roomId).emit("newParticipant", {
				clientId: client.id,
				sessionId,
				profile: WebSocketProfile.GUEST,
			});
		} else {
			client.emit("error", { message: "Room does not exist." });
		}
	}

	@SubscribeMessage("leaveRoom")
	handleLeaveRoom(client: Socket, payload: { roomId: string }): void {
		const { roomId } = payload;

		client.leave(roomId);
		this.webSocketSessionService.removeClientFromRoom(roomId, client.id);

		client.emit("roomLeft", {
			roomId,
			clientId: client.id,
		});

		// Notify other clients in the room about the participant leaving
		client.to(roomId).emit("participantLeft", {
			clientId: client.id,
		});
	}

	@SubscribeMessage("sendGestureToRoom")
	handleSendGestureToRoom(
		client: Socket,
		payload: { roomId: string; gesture: Gesture; data: unknown },
	): void {
		const { roomId, gesture, data } = payload;

		// Log the clients in the room
		const room = this.server.sockets.adapter.rooms.get(roomId);
		if (room) {
			const clientsInRoom = Array.from(room);
			this.logger.verbose(
				`Broadcasting gesture to room ${roomId}, clients: ${clientsInRoom.join(
					", ",
				)}`,
			);
		}

		client.to(roomId).emit("gestureSent", {
			clientId: client.id,
			gesture,
			data,
		});
	}
}
