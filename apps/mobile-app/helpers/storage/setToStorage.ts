import AsyncStorage from "@react-native-async-storage/async-storage";

export const setToStorage = async (key: string, value: string) => {
	try {
		await AsyncStorage.setItem(key, value);
	} catch (error) {
		console.error("Error setting local storage:", error);
	}
};
