import { Injectable, Logger } from "@nestjs/common";
import type { Server } from "socket.io";
import { WebSocketProfile } from "../enums/web-socket-profile.enum";

export interface ClientProfile {
	id: string; // socket client ID
	sessionId: string; // persistent session identifier
	profile: WebSocketProfile;
	joinedAt: Date;
	disconnectedAt?: Date;
	isConnected: boolean;
}

export interface RoomInfo {
	roomId: string;
	clientIds: string[];
	participantCount: number;
	profiles: ClientProfile[];
	hostCount: number;
	guestCount: number;
}

@Injectable()
export class WebSocketSessionService {
	private readonly logger = new Logger(WebSocketSessionService.name);
	private server: Server;
	private roomProfiles: Map<string, ClientProfile[]> = new Map(); // roomId -> profiles array

	setServer(server: Server): void {
		this.server = server;
	}

	clearAllRooms(): void {
		if (!this.server) {
			this.logger.warn("WebSocket server not initialized");
			return;
		}

		const adapter = this.server.sockets.adapter;

		// Disconnect all clients and clear rooms
		for (const [roomId, clients] of adapter.rooms) {
			// Skip socket.io default rooms (socket IDs)
			if (!adapter.sids.has(roomId)) {
				// Disconnect all clients in this room
				for (const clientId of clients) {
					const socket = this.server.sockets.sockets.get(clientId);
					if (socket) {
						socket.leave(roomId);
						socket.disconnect(true);
					}
				}
			}
		}

		// Clear the roomProfiles dictionary
		const roomCount = this.roomProfiles.size;
		this.roomProfiles.clear();

		this.logger.log(`Cleared ${roomCount} rooms on server startup`);
	}

	getAllRooms(): RoomInfo[] {
		if (!this.server) {
			this.logger.warn("WebSocket server not initialized");
			return [];
		}

		const rooms: RoomInfo[] = [];
		const adapter = this.server.sockets.adapter;

		// Iterate through all rooms
		for (const [roomId, clients] of adapter.rooms) {
			// Skip socket.io default rooms (socket IDs)
			if (!adapter.sids.has(roomId)) {
				const clientIds = Array.from(clients);
				const profiles = this.roomProfiles.get(roomId) || [];

				const hostCount = profiles.filter(
					(p) => p.profile === WebSocketProfile.HOST,
				).length;
				const guestCount = profiles.filter(
					(p) => p.profile === WebSocketProfile.GUEST,
				).length;

				rooms.push({
					roomId,
					clientIds,
					participantCount: clientIds.length,
					profiles,
					hostCount,
					guestCount,
				});
			}
		}

		return rooms;
	}

	getRoomInfo(roomId: string): RoomInfo | null {
		if (!this.server) {
			this.logger.warn("WebSocket server not initialized");
			return null;
		}

		const adapter = this.server.sockets.adapter;
		const room = adapter.rooms.get(roomId);

		if (!room) {
			return null;
		}

		const clientIds = Array.from(room);
		const profiles = this.roomProfiles.get(roomId) || [];

		const hostCount = profiles.filter(
			(p) => p.profile === WebSocketProfile.HOST,
		).length;
		const guestCount = profiles.filter(
			(p) => p.profile === WebSocketProfile.GUEST,
		).length;

		return {
			roomId,
			clientIds,
			participantCount: clientIds.length,
			profiles,
			hostCount,
			guestCount,
		};
	}

	getRoomCount(): number {
		if (!this.server) {
			return 0;
		}

		const adapter = this.server.sockets.adapter;
		let roomCount = 0;

		// Count only actual rooms, not socket IDs
		for (const [roomId] of adapter.rooms) {
			if (!adapter.sids.has(roomId)) {
				roomCount++;
			}
		}

		return roomCount;
	}

	addClientToRoom(
		roomId: string,
		clientId: string,
		sessionId: string,
		profile: WebSocketProfile,
	): void {
		const profiles = this.roomProfiles.get(roomId) || [];

		// Check if session already exists in this room
		const existingProfileIndex = profiles.findIndex(
			(p) => p.sessionId === sessionId,
		);

		if (existingProfileIndex !== -1) {
			// Update existing profile with new clientId and mark as connected
			profiles[existingProfileIndex] = {
				...profiles[existingProfileIndex],
				id: clientId,
				isConnected: true,
				disconnectedAt: undefined,
			};
		} else {
			// Add new profile
			profiles.push({
				id: clientId,
				sessionId,
				profile,
				joinedAt: new Date(),
				isConnected: true,
			});
		}

		this.roomProfiles.set(roomId, profiles);

		this.logger.verbose(
			`Client ${clientId} (session ${sessionId}) added to room ${roomId} as ${profile}`,
		);
	}

	removeClientFromRoom(roomId: string, clientId: string): void {
		const profiles = this.roomProfiles.get(roomId) || [];
		const filteredProfiles = profiles.filter((p) => p.id !== clientId);

		if (filteredProfiles.length === 0) {
			this.roomProfiles.delete(roomId);
		} else {
			this.roomProfiles.set(roomId, filteredProfiles);
		}

		this.logger.verbose(`Client ${clientId} removed from room ${roomId}`);
	}

	getClientProfile(roomId: string, clientId: string): ClientProfile | null {
		const profiles = this.roomProfiles.get(roomId) || [];
		return profiles.find((p) => p.id === clientId) || null;
	}

	createRoom(roomId: string, hostId: string, sessionId: string): void {
		// Add host to room profiles
		this.addClientToRoom(roomId, hostId, sessionId, WebSocketProfile.HOST);

		this.logger.verbose(
			`Room ${roomId} created with host ${hostId} (session ${sessionId})`,
		);
	}

	getRoomHost(roomId: string): string | null {
		const profiles = this.roomProfiles.get(roomId) || [];
		const hostProfile = profiles.find(
			(p) => p.profile === WebSocketProfile.HOST,
		);
		return hostProfile?.id || null;
	}

	isRoomHost(roomId: string, clientId: string): boolean {
		const profile = this.getClientProfile(roomId, clientId);
		return profile?.profile === WebSocketProfile.HOST;
	}

	deleteRoom(roomId: string): string[] {
		const profiles = this.roomProfiles.get(roomId) || [];
		const clientIds = profiles.map((p) => p.id);

		// Clean up room data
		this.roomProfiles.delete(roomId);

		this.logger.verbose(`Room ${roomId} deleted`);
		return clientIds;
	}

	handleClientDisconnection(clientId: string): {
		disconnectedSessions: {
			roomId: string;
			sessionId: string;
			profile: WebSocketProfile;
		}[];
	} {
		const disconnectedSessions: {
			roomId: string;
			sessionId: string;
			profile: WebSocketProfile;
		}[] = [];

		// Mark client as disconnected in all rooms
		for (const [roomId, profiles] of this.roomProfiles.entries()) {
			const profileIndex = profiles.findIndex(
				(p) => p.id === clientId && p.isConnected,
			);

			if (profileIndex !== -1) {
				const profile = profiles[profileIndex];

				// Mark as disconnected
				profiles[profileIndex] = {
					...profile,
					isConnected: false,
					disconnectedAt: new Date(),
				};

				disconnectedSessions.push({
					roomId,
					sessionId: profile.sessionId,
					profile: profile.profile,
				});

				this.logger.verbose(
					`Client ${clientId} (session ${profile.sessionId}) disconnected from room ${roomId}`,
				);
			}
		}

		return { disconnectedSessions };
	}

	findRoomBySessionId(sessionId: string): string | null {
		for (const [roomId, profiles] of this.roomProfiles.entries()) {
			if (profiles.some((p) => p.sessionId === sessionId)) {
				return roomId;
			}
		}
		return null;
	}

	getSessionProfile(roomId: string, sessionId: string): ClientProfile | null {
		const profiles = this.roomProfiles.get(roomId) || [];
		return profiles.find((p) => p.sessionId === sessionId) || null;
	}

	isSessionConnected(sessionId: string): boolean {
		for (const profiles of this.roomProfiles.values()) {
			const profile = profiles.find((p) => p.sessionId === sessionId);
			if (profile?.isConnected) {
				return true;
			}
		}
		return false;
	}

	reconnectSession(
		sessionId: string,
		newClientId: string,
	): { success: boolean; roomId?: string; profile?: WebSocketProfile } {
		// Find the room containing this session
		for (const [roomId, profiles] of this.roomProfiles.entries()) {
			const profileIndex = profiles.findIndex((p) => p.sessionId === sessionId);

			if (profileIndex !== -1) {
				const profile = profiles[profileIndex];

				// Update profile with new clientId and mark as connected
				profiles[profileIndex] = {
					...profile,
					id: newClientId,
					isConnected: true,
					disconnectedAt: undefined,
				};

				this.logger.verbose(
					`Session ${sessionId} reconnected with new clientId ${newClientId} in room ${roomId}`,
				);

				return { success: true, roomId, profile: profile.profile };
			}
		}

		return { success: false };
	}
}
