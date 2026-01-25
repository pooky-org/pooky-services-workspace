import { useSocket } from "@/contexts";
import type { Gesture } from "@/enums/Gesture";
import { retrieveRoomId } from "@/helpers";
import React from "react";

export const useGesture = <T = unknown>() => {
	const { isConnected, on, off, emit } = useSocket();
	const [lastGesture, setLastGesture] = React.useState<Gesture | null>(null);
	const [gestureData, setGestureData] = React.useState<T | null>(null);

	React.useEffect(() => {
		if (!isConnected) {
			console.warn("Socket not connected. Cannot receive gesture.");
			return;
		}

		on("gestureSent", (data: unknown) => {
			console.log("Received gestureSent event with data:", data);
			const { gesture } = data as { gesture: Gesture };
			setLastGesture(gesture);
			setGestureData((data as { data: T }).data);
		});

		return () => {
			off("gestureSent");
		};
	}, [isConnected, on, off]);

	const sendGesture = React.useCallback(
		async (gesture: Gesture) => {
			if (!isConnected) {
				console.warn("Socket not connected. Cannot send gesture.");
				return;
			}

			const roomId = await retrieveRoomId();

			emit("sendGestureToRoom", { gesture, roomId });
		},
		[isConnected, emit],
	);

	return { lastGesture, sendGesture, gestureData };
};
