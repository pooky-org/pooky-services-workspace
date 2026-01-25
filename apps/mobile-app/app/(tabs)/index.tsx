import { Gesture as GestureType } from "@/enums/Gesture";
import { useGesture } from "@/hooks/web-socket/useGesture";
import * as Haptics from "expo-haptics";
import { type Href, router } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
	interpolateColor,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
} from "react-native-reanimated";

export default function TouchPad() {
	const { sendGesture, gestureData } = useGesture<{ href: string }>();
	const [lastGesture, setLastGesture] = useState<GestureType | null>(null);

	// Handle redirection when gestureData changes and contains an href
	useEffect(() => {
		if (!gestureData?.href) {
			return;
		}
		const { href } = gestureData;

		try {
			if (href.startsWith("http://") || href.startsWith("https://")) {
				openBrowserAsync(href);
			} else {
				router.push(href as Href);
			}
		} catch (error) {
			console.error("Failed to handle gesture href:", error);
		}
	}, [gestureData]);

	// Animation values
	const scale = useSharedValue(1);
	const backgroundColor = useSharedValue(0);
	const gestureIndicatorOpacity = useSharedValue(0);

	// Haptic feedback function
	const triggerHaptic = (type: "light" | "medium" | "heavy") => {
		if (Platform.OS === "ios") {
			switch (type) {
				case "light":
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					break;
				case "medium":
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
					break;
				case "heavy":
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
					break;
			}
		} else {
			// Android fallback
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		}
	};

	// Update gesture display
	const updateGesture = (gesture: GestureType) => {
		setLastGesture(gesture);
		// Send gesture to server
		sendGesture(gesture);
		gestureIndicatorOpacity.value = withSpring(1, {}, () => {
			gestureIndicatorOpacity.value = withDelay(1500, withSpring(0));
		});
	};

	// Pan gesture for swipes
	const panGesture = Gesture.Pan()
		.onStart(() => {
			runOnJS(triggerHaptic)("light");
			scale.value = withSpring(0.98);
			backgroundColor.value = withSpring(1);
		})
		.onEnd((event) => {
			const { velocityX, velocityY, translationX, translationY } = event;

			scale.value = withSpring(1);
			backgroundColor.value = withSpring(0);

			// Determine swipe direction
			const minVelocity = 500;
			const minTranslation = 50;

			if (Math.abs(velocityX) > Math.abs(velocityY)) {
				// Horizontal swipe
				if (velocityX > minVelocity && translationX > minTranslation) {
					runOnJS(updateGesture)(GestureType.SwipeRight);
					runOnJS(triggerHaptic)("medium");
				} else if (velocityX < -minVelocity && translationX < -minTranslation) {
					runOnJS(updateGesture)(GestureType.SwipeLeft);
					runOnJS(triggerHaptic)("medium");
				}
			} else {
				// Vertical swipe
				if (velocityY > minVelocity && translationY > minTranslation) {
					runOnJS(updateGesture)(GestureType.SwipeDown);
					runOnJS(triggerHaptic)("medium");
				} else if (velocityY < -minVelocity && translationY < -minTranslation) {
					runOnJS(updateGesture)(GestureType.SwipeUp);
					runOnJS(triggerHaptic)("medium");
				}
			}
		});

	// Double tap gesture (défini en premier)
	const doubleTapGesture = Gesture.Tap()
		.numberOfTaps(2)
		.maxDelay(400) // Maximum delay between taps
		.onEnd(() => {
			runOnJS(updateGesture)(GestureType.DoubleTap);
			runOnJS(triggerHaptic)("heavy");
			scale.value = withSpring(0.9, {}, () => {
				scale.value = withSpring(1.05, {}, () => {
					scale.value = withSpring(1);
				});
			});
		});

	// Tap gesture (attend que le double-tap échoue)
	const tapGesture = Gesture.Tap()
		.numberOfTaps(1)
		.requireExternalGestureToFail(doubleTapGesture) // Attend que le double-tap échoue
		.onEnd(() => {
			runOnJS(updateGesture)(GestureType.Tap);
			runOnJS(triggerHaptic)("light");
			scale.value = withSpring(0.95, {}, () => {
				scale.value = withSpring(1);
			});
		});

	// Combine gestures - Retour à Race mais dans le bon ordre
	const combinedGesture = Gesture.Race(
		panGesture, // Pan en premier pour les swipes
		doubleTapGesture,
		tapGesture,
	);

	// Animated styles
	const animatedContainerStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		backgroundColor: interpolateColor(
			backgroundColor.value,
			[0, 1],
			["#1a1a1a", "#2a2a2a"],
		),
	}));

	const animatedIndicatorStyle = useAnimatedStyle(() => ({
		opacity: gestureIndicatorOpacity.value,
	}));

	const getGestureIcon = (gesture: GestureType | null) => {
		switch (gesture) {
			case "swipe-left":
				return "←";
			case "swipe-right":
				return "→";
			case "swipe-up":
				return "↑";
			case "swipe-down":
				return "↓";
			case "tap":
				return "●";
			case "double-tap":
				return "●●";
			default:
				return "";
		}
	};

	const getGestureColor = (gesture: GestureType | null) => {
		switch (gesture) {
			case "swipe-left":
				return "#FF6B6B";
			case "swipe-right":
				return "#4ECDC4";
			case "swipe-up":
				return "#45B7D1";
			case "swipe-down":
				return "#96CEB4";
			case "tap":
				return "#FFEAA7";
			case "double-tap":
				return "#DDA0DD";
			default:
				return "#FFFFFF";
		}
	};

	return (
		<GestureHandlerRootView style={styles.root}>
			<StatusBar barStyle="light-content" backgroundColor="#000000" />

			<GestureDetector gesture={combinedGesture}>
				<Animated.View style={[styles.container, animatedContainerStyle]}>
					{/* Header with instructions */}
					<View style={styles.header}>
						<Text style={styles.title}>TouchPad</Text>
						<Text style={styles.subtitle}>Swipe • Tap • Double Tap</Text>
					</View>

					{/* Main touch area */}
					<View style={styles.touchArea}>
						<Animated.View
							style={[styles.gestureIndicator, animatedIndicatorStyle]}
						>
							<Text
								style={[
									styles.gestureIcon,
									{
										color: getGestureColor(lastGesture),
									},
								]}
							>
								{getGestureIcon(lastGesture)}
							</Text>
							<Text style={styles.gestureText}>
								{lastGesture?.replace("-", " ").toUpperCase()}
							</Text>
						</Animated.View>

						{/* Touch instructions */}
						<View style={styles.instructions}>
							<Text style={styles.instructionText}>Swipe in any direction</Text>
							<Text style={styles.instructionText}>
								Tap or double-tap anywhere
							</Text>
						</View>
					</View>
				</Animated.View>
			</GestureDetector>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: "#000000",
	},
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
	},
	header: {
		alignItems: "center",
		paddingTop: Platform.OS === "ios" ? 60 : 40,
		paddingBottom: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#FFFFFF",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#888888",
		fontWeight: "300",
	},
	touchArea: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	gestureIndicator: {
		alignItems: "center",
		marginBottom: 60,
	},
	gestureIcon: {
		fontSize: 80,
		marginBottom: 10,
	},
	gestureText: {
		fontSize: 24,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	instructions: {
		alignItems: "center",
		opacity: 0.6,
	},
	instructionText: {
		fontSize: 16,
		color: "#CCCCCC",
		marginVertical: 4,
		textAlign: "center",
	},
});
