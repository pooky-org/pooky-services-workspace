import { retrieveRoomId, retrieveSessionId } from "@/helpers";
import { fetchWebSocketRooms } from "@/services/websocketRoomsService";
import type { WebSocketRoom } from "@/types";
import React, { createContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

interface RoomCreatedEvent {
	roomId: string;
	clientId: string;
	sessionId: string;
	profile: string;
}

interface RoomsContextType {
	rooms: WebSocketRoom[];
	isLoading: boolean;
	error: string | null;
	joinedRoomId: string | null;
	handleJoinRoom: (roomId: string) => void;
}

const RoomsContext = createContext<RoomsContextType | undefined>(undefined);

export function RoomsProvider({ children }: { children: React.ReactNode }) {
	const [rooms, setRooms] = useState<WebSocketRoom[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { on, off, emit, isConnected } = useSocket();
	const [joinedRoomId, setJoinedRoomId] = React.useState<string | null>(null);

	const fetchRooms = React.useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const fetchedRooms = await fetchWebSocketRooms();
			setRooms(fetchedRooms);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch rooms";
			setError(errorMessage);
			console.error("Error fetching rooms:", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Retrieve joined room ID from storage on mount
	useEffect(() => {
		retrieveRoomId().then((roomId) => {
			if (roomId) {
				setJoinedRoomId(roomId);
			}
		});
	}, []);

	// Handle room created event
	const handleRoomCreated = React.useCallback(
		(data: unknown) => {
			const roomCreatedData = data as RoomCreatedEvent;

			const websocketRoom: WebSocketRoom = {
				roomId: roomCreatedData.roomId,
				clientIds: [roomCreatedData.clientId],
				participantCount: 1,
				profiles: [],
				hostCount: roomCreatedData.profile === "host" ? 1 : 0,
				guestCount: roomCreatedData.profile === "guest" ? 1 : 0,
			};

			const newRooms = [...rooms, websocketRoom];
			setRooms(newRooms);
		},
		[rooms],
	);

	const handleJoinRoom = React.useCallback(
		(roomId: string) => {
			const sessionId = retrieveSessionId();
			emit("joinRoom", { roomId, sessionId });
		},
		[emit],
	);

	const handleRoomJoined = React.useCallback((data: unknown) => {
		const { roomId } = data as { roomId: string };
		setJoinedRoomId(roomId);
	}, []);

	// Set up socket event listeners
	React.useEffect(() => {
		if (isConnected) {
			on("roomCreated", handleRoomCreated);
		}

		return () => {
			off("roomCreated", handleRoomCreated);
		};
	}, [isConnected, on, off, handleRoomCreated]);

	// Initial fetch when component mounts or socket connects
	React.useEffect(() => {
		if (isConnected) {
			fetchRooms();
		}
	}, [isConnected, fetchRooms]);

	React.useEffect(() => {
		on("roomJoined", handleRoomJoined);

		return () => {
			off("roomJoined", handleRoomJoined);
		};
	}, [on, off, handleRoomJoined]);

	const contextValue: RoomsContextType = {
		rooms,
		isLoading,
		error,
		joinedRoomId,
		handleJoinRoom,
	};

	return (
		<RoomsContext.Provider value={contextValue}>
			{children}
		</RoomsContext.Provider>
	);
}

export function useRooms() {
	const context = React.useContext(RoomsContext);
	if (context === undefined) {
		throw new Error("useRooms must be used within a RoomsProvider");
	}
	return context;
}
