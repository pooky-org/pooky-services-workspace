import AsyncStorage from "@react-native-async-storage/async-storage";

export const removeFromStorage = async (key: string) => {
	try {
		await AsyncStorage.removeItem(key);
	} catch (error) {
		console.error("Error removing local storage:", error);
	}
};
