import type { Module } from "@/types/module";

const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function fetchRootModules(): Promise<Module[]> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/modules/roots`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Failed to fetch root modules:", error);
		throw error;
	}
}

export async function fetchModuleChildren(parentId: string): Promise<Module[]> {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/modules/${parentId}/children`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Failed to fetch module children:", error);
		throw error;
	}
}
