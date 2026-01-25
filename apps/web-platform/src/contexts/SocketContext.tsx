"use client";

import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	io,
	type ManagerOptions,
	type Socket,
	type SocketOptions,
} from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	emit: (event: string, data?: unknown) => void;
	on: (event: string, callback: (data: unknown) => void) => void;
	off: (event: string, callback?: (data: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
	children: ReactNode;
	url?: string;
	path?: string;
	options?: Partial<ManagerOptions & SocketOptions>;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
	children,
	url = process.env.NEXT_PUBLIC_SOCKET_URL,
	path = process.env.NEXT_PUBLIC_SOCKET_PATH,
	options = {},
}) => {
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket | null>(null);

	const optionsRef = useRef(options);
	optionsRef.current = options;

	// biome-ignore lint/correctness/useExhaustiveDependencies: Need to be recreated when isConnected changes to keep be in sync with the current connection state
	const emit = useCallback(
		(event: string, data?: unknown) => {
			if (socketRef.current) {
				socketRef.current.emit(event, data);
			}
		},
		[isConnected],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Need to be recreated when isConnected changes to keep be in sync with the current connection state
	const on = useCallback(
		(event: string, callback: (data: unknown) => void) => {
			if (socketRef.current) {
				socketRef.current.on(event, callback);
			}
		},
		[isConnected],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Need to be recreated when isConnected changes to keep be in sync with the current connection state
	const off = useCallback(
		(event: string, callback?: (data: unknown) => void) => {
			if (socketRef.current) {
				socketRef.current.off(event, callback);
			}
		},
		[isConnected],
	);

	const safeGenerateSessionId = useCallback(() => {
		const sessionId = localStorage.getItem("sessionId");
		if (!sessionId) {
			const newSessionId = uuidv4();
			localStorage.setItem("sessionId", newSessionId);
			return newSessionId;
		}
		return sessionId;
	}, []);

	// Handle socket connection lifecycle
	useEffect(() => {
		// Initialize socket connection
		socketRef.current = io(url, {
			path,
			...optionsRef.current,
		});

		const socket = socketRef.current;

		// Connection event handlers
		socket.on("connect", () => {
			console.log("Socket connected:", socket.id);
			safeGenerateSessionId();
			setIsConnected(true);
		});

		socket.on("disconnect", () => {
			setIsConnected(false);
		});

		// Cleanup on unmount
		return () => {
			if (socket) {
				socket.disconnect();
				socketRef.current = null;
			}
		};
	}, [url, path, safeGenerateSessionId]);

	// Handle room creation when connected
	useEffect(() => {
		if (!isConnected) {
			return;
		}

		const localStorageKey = "roomId";
		const roomId = localStorage.getItem(localStorageKey);

		const sessionId = localStorage.getItem("sessionId");

		if (!roomId) {
			emit("createRoom", { sessionId });
		} else {
			console.log("Attempting to reconnect to room:", roomId);
			emit("reconnect", { roomId, sessionId });
		}

		socketRef.current?.on("roomCreated", ({ roomId }: { roomId: string }) => {
			console.log("Room created with ID:", roomId);
			localStorage.setItem(localStorageKey, roomId);
		});

		socketRef.current?.on("reconnectionFailed", () => {
			localStorage.removeItem(localStorageKey);
			emit("createRoom", { sessionId });
		});

		return () => {
			socketRef.current?.off("roomCreated");
		};
	}, [isConnected, emit]);

	const value: SocketContextType = {
		socket: socketRef.current,
		isConnected,
		emit,
		on,
		off,
	};

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};

export const useSocket = (): SocketContextType => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};
