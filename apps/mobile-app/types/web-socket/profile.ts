import type { WebSocketProfile } from "@/enums/WebSocketProfile";

export interface ClientProfile {
	id: string; // socket client ID
	sessionId: string; // persistent session identifier
	profile: WebSocketProfile;
	joinedAt: Date;
	disconnectedAt?: Date;
	isConnected: boolean;
}
