import { getFromStorage } from "../storage";

export const retrieveRoomId = async () => {
	try {
		const roomId = await getFromStorage("roomId");
		return roomId;
	} catch (error) {
		console.error("Error retrieving room ID:", error);
		return null;
	}
};
