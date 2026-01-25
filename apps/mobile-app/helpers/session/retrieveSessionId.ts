import { getFromStorage } from "../storage";

export const retrieveSessionId = async () => {
	try {
		const sessionId = await getFromStorage("sessionId");
		return sessionId;
	} catch (error) {
		console.error("Error retrieving session ID:", error);
		return null;
	}
};
