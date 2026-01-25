import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import WebSocketRoomsList from "@/components/WebSocketRoomsList";
import { useRooms, useSocket } from "@/contexts";
import { setToStorage } from "@/helpers";
import type { WebSocketRoom } from "@/types";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function RoomsScreen() {
	// Use Socket context for real-time room updates
	const { rooms, isLoading, error, handleJoinRoom } = useRooms();
	const { isConnected } = useSocket();

	const handleRoomPress = (room: WebSocketRoom) => {
		handleJoinRoom(room.roomId);
		setToStorage("roomId", room.roomId);
		router.push("/(tabs)");
	};

	return (
		<ThemedView style={styles.container}>
			<View style={styles.titleContainer}>
				<ThemedText type="title">WebSocket Rooms</ThemedText>
				<View
					style={[
						styles.connectionBadge,
						isConnected ? styles.connectedBadge : styles.disconnectedBadge,
					]}
				>
					<ThemedText
						style={[
							styles.connectionText,
							isConnected ? styles.connectedText : styles.disconnectedText,
						]}
					>
						{isConnected ? "Connected" : "Disconnected"}
					</ThemedText>
				</View>
			</View>

			<ScrollView
				style={styles.scrollContainer}
				showsVerticalScrollIndicator={false}
			>
				{isLoading && (
					<View style={styles.messageContainer}>
						<ThemedText>Loading rooms...</ThemedText>
					</View>
				)}

				{error && (
					<View style={styles.messageContainer}>
						<ThemedText style={styles.errorText}>Error: {error}</ThemedText>
					</View>
				)}

				{!isLoading && !error && rooms.length === 0 && (
					<View style={styles.messageContainer}>
						<ThemedText>No websocket rooms available.</ThemedText>
					</View>
				)}

				{!isLoading && !error && rooms.length > 0 && (
					<View style={styles.roomsContainer}>
						<ThemedText type="subtitle" style={styles.roomsTitle}>
							Available Rooms ({rooms.length})
						</ThemedText>
						<WebSocketRoomsList rooms={rooms} onRoomPress={handleRoomPress} />
					</View>
				)}
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	scrollContainer: {
		flex: 1,
	},
	titleContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		gap: 8,
		marginBottom: 24,
		paddingHorizontal: 0,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: "absolute",
	},
	messageContainer: {
		padding: 32,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 16,
	},
	errorText: {
		color: "#ff6b6b",
		textAlign: "center",
	},
	roomsContainer: {
		flex: 1,
		paddingBottom: 20,
	},
	roomsTitle: {
		marginBottom: 8,
		paddingHorizontal: 0,
	},
	instructionText: {
		marginBottom: 20,
		paddingHorizontal: 0,
		opacity: 0.7,
		textAlign: "center",
	},
	connectionBadge: {
		paddingHorizontal: 8,
		borderRadius: 12,
	},
	connectedBadge: {
		backgroundColor: "rgba(34, 197, 94, 0.2)",
	},
	disconnectedBadge: {
		backgroundColor: "rgba(239, 68, 68, 0.2)",
	},
	connectionText: {
		fontSize: 12,
		fontWeight: "600",
	},
	connectedText: {
		color: "#22c55e",
	},
	disconnectedText: {
		color: "#ef4444",
	},
});
