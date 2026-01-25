import { safeGenerateSessionId } from "@/helpers";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import "react-native-get-random-values"; // Required for uuid in React Native
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	emit: (event: string, data?: unknown) => void;
	on: (event: string, callback: (data: unknown) => void) => void;
	off: (event: string, callback?: (data: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
	children: React.ReactNode;
	url?: string;
	path?: string;
	options?: Record<string, unknown>;
}

export function SocketProvider({
	children,
	url = process.env.EXPO_PUBLIC_SOCKET_URL,
	path = process.env.EXPO_PUBLIC_SOCKET_PATH,
	options = {},
}: SocketProviderProps) {
	console.log(url, path);
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

	// Handle socket connection lifecycle
	useEffect(() => {
		console.log("🔌 [WebSocket] Attempting to connect...");
		console.log("🔌 [WebSocket] URL:", url);
		console.log("🔌 [WebSocket] Path:", path);

		if (!url) {
			console.error(
				"❌ [WebSocket] No URL provided! Check EXPO_PUBLIC_SOCKET_URL env variable",
			);
			return;
		}

		// Initialize socket connection
		socketRef.current = io(url, {
			path,
			transports: ["websocket", "polling"],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 10000,
			...optionsRef.current,
		});

		const socket = socketRef.current;

		console.log("🔌 [WebSocket] Socket instance created");

		// Connection event handlers
		socket.on("connect", () => {
			console.log("✅ [WebSocket] Connected successfully!");
			console.log("✅ [WebSocket] Socket ID:", socket.id);
			safeGenerateSessionId();
			setIsConnected(true);
		});

		socket.on("disconnect", (reason) => {
			console.log("🔴 [WebSocket] Disconnected. Reason:", reason);
			setIsConnected(false);
		});

		socket.on("connect_error", (error) => {
			console.error("❌ [WebSocket] Connection error:", error.message);
			console.error(
				"❌ [WebSocket] Error details:",
				JSON.stringify(error, null, 2),
			);
		});

		socket.on("reconnect_attempt", (attemptNumber) => {
			console.log(`🔄 [WebSocket] Reconnection attempt #${attemptNumber}`);
		});

		socket.on("reconnect_failed", () => {
			console.error("❌ [WebSocket] Reconnection failed after all attempts");
		});

		socket.on("error", (error) => {
			console.error("❌ [WebSocket] General error:", error);
		});

		// Cleanup on unmount
		return () => {
			console.log("🧹 [WebSocket] Cleaning up connection...");
			if (socket) {
				socket.disconnect();
				socketRef.current = null;
			}
		};
	}, [url, path]);

	const contextValue: SocketContextType = {
		socket: socketRef.current,
		isConnected,
		emit,
		on,
		off,
	};

	return (
		<SocketContext.Provider value={contextValue}>
			{children}
		</SocketContext.Provider>
	);
}

export function useSocket(): SocketContextType {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
}
