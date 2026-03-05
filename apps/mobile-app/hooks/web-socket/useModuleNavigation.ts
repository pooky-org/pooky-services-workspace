import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/contexts";
import { retrieveRoomId } from "@/helpers";

interface ModuleNavigationData {
	clientId: string;
	moduleId: string | null;
	submoduleId: string | null;
	path: string;
}

export const useModuleNavigation = () => {
	const { isConnected, on, off, emit } = useSocket();
	const [navigationData, setNavigationData] =
		useState<ModuleNavigationData | null>(null);

	useEffect(() => {
		if (!isConnected) return;

		const handler = (data: unknown) => {
			setNavigationData(data as ModuleNavigationData);
		};

		on("moduleNavigated", handler);

		return () => {
			off("moduleNavigated", handler);
		};
	}, [isConnected, on, off]);

	const navigateToModule = useCallback(
		async (params: {
			moduleId: string | null;
			submoduleId: string | null;
			path: string;
		}) => {
			if (!isConnected) {
				console.warn("Socket not connected. Cannot send module navigation.");
				return;
			}

			const roomId = await retrieveRoomId();

			emit("navigateToModule", {
				roomId,
				moduleId: params.moduleId,
				submoduleId: params.submoduleId,
				path: params.path,
			});
		},
		[isConnected, emit],
	);

	return { navigateToModule, navigationData };
};
