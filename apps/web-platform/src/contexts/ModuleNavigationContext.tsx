"use client";

import { useRouter } from "next/navigation";
import React, {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useSocket } from "./SocketContext";

interface ModuleNavigationData {
	clientId: string;
	moduleId: string | null;
	submoduleId: string | null;
	path: string;
}

interface ModuleNavigationContextType {
	navigationData: ModuleNavigationData | null;
}

const ModuleNavigationContext = createContext<
	ModuleNavigationContextType | undefined
>(undefined);

interface ModuleNavigationProviderProps {
	children: ReactNode;
}

export const ModuleNavigationProvider: React.FC<
	ModuleNavigationProviderProps
> = ({ children }) => {
	const [navigationData, setNavigationData] =
		useState<ModuleNavigationData | null>(null);
	const { on, off } = useSocket();
	const router = useRouter();

	useEffect(() => {
		const handler = (data: unknown) => {
			const navData = data as ModuleNavigationData;
			setNavigationData(navData);

			console.log("navdata", navData);

			const subPath = navData.path.replace(/^\/modules\/?/, "");
			if (subPath) {
				router.push(`/modules/${subPath}`);
			} else {
				router.push("/modules");
			}
		};

		on("moduleNavigated", handler);

		return () => {
			off("moduleNavigated", handler);
		};
	}, [on, off, router]);

	return (
		<ModuleNavigationContext.Provider value={{ navigationData }}>
			{children}
		</ModuleNavigationContext.Provider>
	);
};

export const useModuleNavigation = (): ModuleNavigationContextType => {
	const context = useContext(ModuleNavigationContext);
	if (context === undefined) {
		throw new Error(
			"useModuleNavigation must be used within a ModuleNavigationProvider",
		);
	}
	return context;
};
