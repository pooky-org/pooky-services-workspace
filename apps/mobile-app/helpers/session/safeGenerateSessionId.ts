import "react-native-get-random-values"; // Required for uuid in React Native
import { v4 as uuidv4 } from "uuid";
import { setToStorage } from "../storage";
import { retrieveSessionId } from "./retrieveSessionId";

export const safeGenerateSessionId = async () => {
	const sessionId = await retrieveSessionId();
	if (!sessionId) {
		const newSessionId = uuidv4();
		await setToStorage("sessionId", newSessionId);
		return newSessionId;
	}
};
