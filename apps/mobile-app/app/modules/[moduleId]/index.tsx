import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { fetchModuleChildren } from "@/services/modulesService";
import type { Module } from "@/types/module";
import { type Href, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	FlatList,
	Image,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

const NUM_COLUMNS = 3;
const GRID_SPACING = 12;
const screenWidth = Dimensions.get("window").width;
const ITEM_SIZE =
	(screenWidth - GRID_SPACING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function SubModulesScreen() {
	const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
	const [submodules, setSubmodules] = useState<Module[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadSubmodules = useCallback(async () => {
		if (!moduleId) return;
		try {
			setIsLoading(true);
			setError(null);
			const data = await fetchModuleChildren(moduleId);
			setSubmodules(data);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to load sub-modules",
			);
		} finally {
			setIsLoading(false);
		}
	}, [moduleId]);

	useEffect(() => {
		loadSubmodules();
	}, [loadSubmodules]);

	const handleSubmodulePress = (submodule: Module) => {
		router.push(
			`/modules/${moduleId}/${submodule._id}?submoduleName=${encodeURIComponent(submodule.name)}` as Href,
		);
	};

	const renderSubmoduleItem = ({ item }: { item: Module }) => (
		<TouchableOpacity
			style={[styles.moduleCard, { backgroundColor: item.color }]}
			onPress={() => handleSubmodulePress(item)}
			activeOpacity={0.7}
		>
			<Image
				source={{ uri: item.icon }}
				style={styles.moduleIcon}
				resizeMode="contain"
			/>
			<ThemedText style={styles.moduleName} numberOfLines={2}>
				{item.name}
			</ThemedText>
		</TouchableOpacity>
	);

	if (isLoading) {
		return (
			<ThemedView style={styles.centerContainer}>
				<ActivityIndicator size="large" color="#0a7ea4" />
				<ThemedText style={styles.loadingText}>
					Loading sub-modules...
				</ThemedText>
			</ThemedView>
		);
	}

	if (error) {
		return (
			<ThemedView style={styles.centerContainer}>
				<ThemedText style={styles.errorText}>Error: {error}</ThemedText>
				<TouchableOpacity
					style={styles.retryButton}
					onPress={loadSubmodules}
				>
					<ThemedText style={styles.retryText}>Retry</ThemedText>
				</TouchableOpacity>
			</ThemedView>
		);
	}

	if (submodules.length === 0) {
		return (
			<ThemedView style={styles.centerContainer}>
				<ThemedText>No sub-modules available.</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<FlatList
				data={submodules}
				renderItem={renderSubmoduleItem}
				keyExtractor={(item) => item._id}
				numColumns={NUM_COLUMNS}
				contentContainerStyle={styles.gridContainer}
				columnWrapperStyle={styles.row}
				showsVerticalScrollIndicator={false}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	gridContainer: {
		padding: GRID_SPACING,
	},
	row: {
		justifyContent: "flex-start",
		gap: GRID_SPACING,
		marginBottom: GRID_SPACING,
	},
	moduleCard: {
		width: ITEM_SIZE,
		height: ITEM_SIZE,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		padding: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	moduleIcon: {
		width: ITEM_SIZE * 0.4,
		height: ITEM_SIZE * 0.4,
		marginBottom: 8,
		tintColor: "#FFFFFF",
	},
	moduleName: {
		fontSize: 13,
		fontWeight: "600",
		color: "#FFFFFF",
		textAlign: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 16,
	},
	errorText: {
		color: "#FF6B6B",
		fontSize: 16,
		textAlign: "center",
		marginBottom: 16,
	},
	retryButton: {
		backgroundColor: "#0a7ea4",
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
});
