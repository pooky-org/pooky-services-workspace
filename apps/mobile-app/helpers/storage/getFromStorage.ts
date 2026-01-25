import AsyncStorage from "@react-native-async-storage/async-storage";

export const getFromStorage = async (key: string): Promise<string | null> => {
	try {
		const value = await AsyncStorage.getItem(key);
		return value;
	} catch (error) {
		console.error("Error getting local storage:", error);
		return null;
	}
};
