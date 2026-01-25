import { ThemedText } from "@/components/ThemedText";
import type { WebSocketRoom } from "@/types/web-socket/room";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface WebSocketRoomItemProps {
	room: WebSocketRoom;
	onPress?: (room: WebSocketRoom) => void;
}

function WebSocketRoomItem({ room, onPress }: WebSocketRoomItemProps) {
	const handlePress = () => {
		if (onPress) {
			onPress(room);
		}
	};

	return (
		<TouchableOpacity onPress={handlePress} style={styles.roomItem}>
			<View style={styles.roomContent}>
				<View style={styles.roomHeader}>
					<ThemedText type="defaultSemiBold" style={styles.roomName}>
						Room {room.roomId}
					</ThemedText>
					<View
						style={[
							styles.statusBadge,
							room.participantCount > 0
								? styles.activeBadge
								: styles.inactiveBadge,
						]}
					>
						<ThemedText
							style={[
								styles.statusText,
								room.participantCount > 0
									? styles.activeText
									: styles.inactiveText,
							]}
						>
							{room.participantCount > 0 ? "Active" : "Empty"}
						</ThemedText>
					</View>
				</View>

				<View style={styles.roomDetails}>
					<ThemedText style={styles.participantCount}>
						{room.participantCount} participant
						{room.participantCount !== 1 ? "s" : ""}
					</ThemedText>
					<View style={styles.roleBreakdown}>
						<ThemedText style={styles.roleText}>
							{room.hostCount} host{room.hostCount !== 1 ? "s" : ""}
						</ThemedText>
						<ThemedText style={styles.roleText}>
							{room.guestCount} guest{room.guestCount !== 1 ? "s" : ""}
						</ThemedText>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}

interface WebSocketRoomsListProps {
	rooms: WebSocketRoom[];
	onRoomPress?: (room: WebSocketRoom) => void;
}

export default function WebSocketRoomsList({
	rooms,
	onRoomPress,
}: WebSocketRoomsListProps) {
	return (
		<View style={styles.listContainer}>
			{rooms.map((room) => (
				<WebSocketRoomItem
					key={room.roomId}
					room={room}
					onPress={() => onRoomPress?.(room)}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	listContainer: {
		paddingHorizontal: 0,
		paddingVertical: 0,
	},
	roomItem: {
		marginBottom: 16,
	},
	roomContent: {
		padding: 20,
		borderRadius: 16,
		backgroundColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.15)",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	roomHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	roomName: {
		flex: 1,
		fontSize: 20,
		fontWeight: "600",
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	activeBadge: {
		backgroundColor: "rgba(34, 197, 94, 0.2)",
	},
	inactiveBadge: {
		backgroundColor: "rgba(156, 163, 175, 0.2)",
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
	},
	activeText: {
		color: "#22c55e",
	},
	inactiveText: {
		color: "#9ca3af",
	},
	roomDescription: {
		fontSize: 14,
		opacity: 0.8,
		marginBottom: 12,
		lineHeight: 20,
	},
	roomDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	participantCount: {
		fontSize: 14,
		opacity: 0.7,
	},
	roomType: {
		fontSize: 12,
		opacity: 0.6,
		fontStyle: "italic",
	},
	roleBreakdown: {
		flexDirection: "row",
		gap: 12,
	},
	roleText: {
		fontSize: 12,
		opacity: 0.7,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
});
