import type { ClientProfile } from "./profile";

export interface WebSocketRoom {
	roomId: string;
	clientIds: string[];
	participantCount: number;
	profiles: ClientProfile[];
	hostCount: number;
	guestCount: number;
}
