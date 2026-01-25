import type { WebSocketRoom } from "@/types/web-socket/room";

const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function fetchWebSocketRooms(): Promise<WebSocketRoom[]> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/websocket-rooms`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to fetch websocket rooms:", error);
		throw error;
	}
}
