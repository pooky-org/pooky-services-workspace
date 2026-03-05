import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function ModuleDetailLayout() {
	const router = useRouter();
	const { moduleName } = useLocalSearchParams<{ moduleName: string }>();
	const colorScheme = useColorScheme();

	const handleBackPress = () => {
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
					title: moduleName || "Sub-modules",
				}}
			/>
			<Stack.Screen
				name="[submoduleId]"
				options={{
					title: "TouchPad",
				}}
			/>
		</Stack>
	);
}
