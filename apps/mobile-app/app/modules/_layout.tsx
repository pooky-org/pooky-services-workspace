import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { useRooms } from "@/contexts/RoomsContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useModuleNavigation } from "@/hooks/web-socket/useModuleNavigation";

export default function ModulesLayout() {
	const router = useRouter();
	const { joinedRoomId } = useRooms();
	const colorScheme = useColorScheme();
	const { navigateToModule } = useModuleNavigation();

	const handleBackPress = () => {
		navigateToModule({
			moduleId: null,
			submoduleId: null,
			path: "/modules",
		});
		router.back();
	};

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerTitleStyle: {
					fontSize: 18,
					fontWeight: "600",
				},
				headerStyle: {
					backgroundColor: Colors[colorScheme ?? "light"].background,
				},
				headerTintColor: Colors[colorScheme ?? "light"].text,
				headerLeft: () => (
					<TouchableOpacity
						onPress={handleBackPress}
						style={{
							flexDirection: "row",
							alignItems: "center",
							paddingRight: 16,
						}}
					>
						<Text
							style={{
								fontSize: 16,
								marginRight: 4,
								color: Colors[colorScheme ?? "light"].tint,
							}}
						>
							←
						</Text>
						<Text
							style={{
								fontSize: 16,
								color: Colors[colorScheme ?? "light"].tint,
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
					title: `Modules — ${joinedRoomId || "Room"}`,
				}}
			/>
			<Stack.Screen
				name="[moduleId]"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
