"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { GestureProvider } from "@/src/contexts";

export default function Layout({ children }: PropsWithChildren) {
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
}
