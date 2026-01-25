import { Colors } from "@/constants/Colors";
import { useRooms } from "@/contexts/RoomsContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function TabsLayout() {
	const router = useRouter();
	const { joinedRoomId } = useRooms();
	const colorScheme = useColorScheme();

	const handleBackPress = () => {
		router.back();
	};

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTitle: joinedRoomId || "Room",
				headerTitleStyle: {
					fontSize: 18,
					fontWeight: "600",
				},
				headerStyle: {
					backgroundColor: Colors[colorScheme ?? "light"].background,
				},
				headerLeft: () => (
					<TouchableOpacity
						onPress={handleBackPress}
						style={{
							flexDirection: "row",
							alignItems: "center",
							paddingLeft: 8,
							paddingRight: 16,
						}}
					>
						<Text
							style={{
								fontSize: 16,
								marginRight: 4,
							}}
						>
							←
						</Text>
						<Text
							style={{
								fontSize: 16,
							}}
						>
							Back
						</Text>
					</TouchableOpacity>
				),
			}}
		>
			<Stack.Screen
				name="index"
				options={{
					title: joinedRoomId || "Room",
				}}
			/>
		</Stack>
	);
}
