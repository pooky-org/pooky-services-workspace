"use client";

import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { EGesture } from "../enums";
import { useSocket } from "./SocketContext";

interface GestureContextType {
	currentGesture: EGesture | null;
	gestureData: unknown | null;
	sendGestureToRoom: (gesture: EGesture, data?: unknown) => void;
}

const GestureContext = createContext<GestureContextType | undefined>(undefined);

interface GestureProviderProps {
	children: ReactNode;
}

export const GestureProvider: React.FC<GestureProviderProps> = ({
	children,
}) => {
	const [currentGesture, setCurrentGesture] = useState<EGesture | null>(null);
	const [gestureData, setGestureData] = useState<unknown>(null);
	const { on, off, emit } = useSocket();

	useEffect(() => {
		on("gestureSent", (data: unknown) => {
			const { gesture, data: gestureData } = data as {
				gesture: EGesture;
				data: unknown;
			};
			setCurrentGesture(gesture);
			setGestureData(gestureData);
		});

		return () => {
			off("gestureSent");
		};
	}, [on, off]);

	// Separate effect to handle clearing gesture
	useEffect(() => {
		if (currentGesture) {
			const timeout = setTimeout(() => {
				setCurrentGesture(null);
			}, 300);

			return () => clearTimeout(timeout);
		}
	}, [currentGesture]);

	useEffect(() => {
		console.log("Current gesture updated:", currentGesture);
	}, [currentGesture]);

	const sendGestureToRoom = useCallback(
		(gesture: EGesture, data?: unknown) => {
			const roomId = localStorage.getItem("roomId");

			if (!roomId) {
				return;
			}

			emit("sendGestureToRoom", { roomId, gesture, data });
		},
		[emit],
	);

	const value: GestureContextType = {
		currentGesture,
		sendGestureToRoom,
		gestureData,
	};

	return (
		<GestureContext.Provider value={value}>{children}</GestureContext.Provider>
	);
};

export const useGesture = (): GestureContextType => {
	const context = useContext(GestureContext);
	if (context === undefined) {
		throw new Error("useGesture must be used within a GestureProvider");
	}
	return context;
};
