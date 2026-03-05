import {
	Stack,
	useLocalSearchParams,
	usePathname,
	useRouter,
} from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useModuleNavigation } from "@/hooks/web-socket/useModuleNavigation";

export default function ModuleDetailLayout() {
	const router = useRouter();
	const pathname = usePathname();
	const { moduleName, moduleSlug, moduleId } = useLocalSearchParams<{
		moduleName: string;
		moduleSlug: string;
		moduleId: string;
	}>();
	const colorScheme = useColorScheme();
	const { navigateToModule } = useModuleNavigation();

	const handleBackPress = () => {
		// pathname like /modules/<moduleId>/<submoduleId> means we're on TouchPad
		// pathname like /modules/<moduleId> means we're on the submodules list
		const pathParts = pathname.split("/").filter(Boolean);
		const isOnTouchPad = pathParts.length > 2;

		if (isOnTouchPad) {
			// Back from TouchPad to submodules list
			navigateToModule({
				moduleId: moduleId || null,
				submoduleId: null,
				path: `/modules/${moduleSlug || ""}`,
			});
		} else {
			// Back from submodules list to modules list
			navigateToModule({
				moduleId: null,
				submoduleId: null,
				path: "/modules",
			});
		}
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
