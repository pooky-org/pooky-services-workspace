"use client";

import { GestureProvider } from "@/src/contexts";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";

export const ModulesGestureLayout = ({ children }: PropsWithChildren) => {
	const [roomId, setRoomId] = useState<string | null>(null);

	useEffect(() => {
		// Only access localStorage on client side
		if (typeof window !== "undefined") {
			setRoomId(localStorage.getItem("roomId"));
		}
	}, []);

	return (
		<GestureProvider>
			<span className="absolute top-4 right-4 z-10 text-white">{roomId}</span>
			{children}
		</GestureProvider>
	);
};
export default ModulesGestureLayout;
