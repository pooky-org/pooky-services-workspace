"use client";

import { createContext, type ReactNode, useContext } from "react";

export interface RuntimeConfig {
	apiUrl: string;
	socketUrl: string;
	socketPath: string;
	desktopSseSubscriptionId: string;
	mobileSseSubscriptionId: string;
}

const RuntimeConfigContext = createContext<RuntimeConfig | undefined>(undefined);

interface RuntimeConfigProviderProps {
	children: ReactNode;
	config: RuntimeConfig;
}

export const RuntimeConfigProvider: React.FC<RuntimeConfigProviderProps> = ({
	children,
	config,
}) => {
	return (
		<RuntimeConfigContext.Provider value={config}>
			{children}
		</RuntimeConfigContext.Provider>
	);
};

export const useRuntimeConfig = (): RuntimeConfig => {
	const context = useContext(RuntimeConfigContext);
	if (context === undefined) {
		throw new Error(
			"useRuntimeConfig must be used within a RuntimeConfigProvider",
		);
	}
	return context;
};
